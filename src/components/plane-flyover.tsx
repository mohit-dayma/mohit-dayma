'use client';

import {
  easeInOut,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useTime,
  useTransform,
} from 'motion/react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

const LOOP = 44000;
// Ultra-smooth S: 55 points (8 sub-segments per U-turn) vs 31/19 before.
// Linear between dense points approximates a spline with <22deg per segment,
// so no visible kink -> smooth curve, not jerky. 31 points was still 45deg
// per segment and felt jerky.
const TIMES = [
  0, 0.10215, 0.11022, 0.11828, 0.12634, 0.13441, 0.14248, 0.15054, 0.1586,
  0.16667, 0.26882, 0.27688, 0.28495, 0.29302, 0.30108, 0.30914, 0.3172,
  0.32527, 0.33333, 0.43548, 0.44354, 0.45161, 0.45968, 0.46774, 0.47581,
  0.48387, 0.49194, 0.5, 0.60215, 0.61021, 0.61828, 0.62635, 0.63441, 0.64248,
  0.65054, 0.6586, 0.66667, 0.76882, 0.77689, 0.78495, 0.79302, 0.80108,
  0.80914, 0.8172, 0.82527, 0.83333, 0.93548, 0.94354, 0.95161, 0.95968,
  0.96774, 0.97581, 0.98387, 0.99194, 1,
];
// S starts 15% behind edge (7.7 vs -4) - early but not drifty (75% was too early)
const X = [
  74, 7.7, 2.39, -2.92, -6.46, -10, -8.8, -7.6, -5.8, -4, 60.6, 65.82, 71.04,
  74.52, 78, 76.6, 75.2, 73.1, 71, 8.1, 2.97, -2.16, -5.58, -9, -7.6, -6.2,
  -4.1, -2, 61.75, 66.92, 72.1, 75.55, 79, 77.4, 75.8, 73.4, 71, 7.25, 2.08,
  -3.1, -6.55, -10, -8.6, -7.2, -5.1, -3, 61.6, 66.82, 72.04, 75.52, 79, 78.0,
  77.0, 75.5, 74,
];
const Y = [
  10, 42.3, 43.64, 44.99, 47.5, 50, 50.65, 51.3, 51.65, 52, 74.1, 74.87, 75.64,
  77.07, 78.5, 78.66, 78.83, 78.91, 79, 77.3, 77.25, 77.19, 77.09, 77, 77.0,
  77.0, 77.0, 77, 50.65, 49.58, 48.5, 46.5, 44.5, 44.66, 44.83, 44.91, 45,
  16.95, 15.82, 14.69, 12.59, 10.5, 10.66, 10.82, 10.91, 11, 9.3, 9.16, 9.02,
  8.76, 8.5, 8.98, 9.47, 9.73, 10,
];
const AZIMUTH = [
  315, 315, 297.0, 279, 252.0, 225, 198.0, 171, 153.0, 135, 135, 153.0, 171,
  198.0, 225, 252.0, 279, 297.0, 315, 315, 333.0, 351, 378.0, 405, 432.0, 459,
  477.0, 495, 495, 477.0, 459, 432.0, 405, 378.0, 351, 333.0, 315, 315, 333.0,
  351, 378.0, 405, 432.0, 459, 477.0, 495, 495, 513.0, 531, 558.0, 585, 612.0,
  639, 657.0, 675,
];
const POLAR = [
  78, 78, 75.5, 73, 70.5, 68, 70.5, 73, 75.5, 78, 78, 75.5, 73, 70.5, 68, 70.5,
  73, 75.5, 78, 78, 75.5, 73, 70.5, 68, 70.5, 73, 75.5, 78, 78, 75.5, 73, 70.5,
  68, 70.5, 73, 75.5, 78, 78, 75.5, 73, 70.5, 68, 70.5, 73, 75.5, 78, 78, 76.5,
  75, 73.5, 72, 73.5, 75, 76.5, 78,
];

const linear = (t: number) => t;
const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const LEG_PAIRS: Array<[number, number]> = [
  [0, 1],
  [9, 10],
  [18, 19],
  [27, 28],
  [36, 37],
  [45, 46],
];
const TURN_IDX = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23,
  24, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44,
  46, 47, 48, 49, 50, 51, 52, 53,
]);
const EASE_X = TIMES.slice(0, -1).map(() => linear);
const EASE_Y = TIMES.slice(0, -1).map(() => linear);
const EASE_YAW = TIMES.slice(0, -1).map(() => linear);
const EASE_PITCH = TIMES.slice(0, -1).map((_, i) =>
  TURN_IDX.has(i) ? easeInOut : linear,
);

function buildPitches(heightWidthRatio: number): number[] {
  const pitches = TIMES.map(() => 0);
  for (const [a, b] of LEG_PAIRS) {
    const dx = X[b] - X[a];
    const dy = Y[b] - Y[a];
    const deg =
      (Math.atan((Math.abs(dy) * heightWidthRatio) / Math.abs(dx)) * 180) /
      Math.PI;
    const signed =
      Math.round(Math.sign(dx) * (Math.sign(dy) || 1) * deg * 10) / 10;
    pitches[a] = signed;
    pitches[b] = signed;
  }
  pitches[pitches.length - 1] = pitches[0];
  return pitches;
}

export const PlaneFlyover = () => {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const prefersReducedMotion = useReducedMotion();
  const viewerRef = useRef<HTMLElement | null>(null);
  const time = useTime();
  const phase = useTransform(time, (t) => t % LOOP);
  const [hwRatio, setHwRatio] = useState(0.5625);

  useEffect(() => {
    const update = () => setHwRatio(window.innerHeight / window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const marks = TIMES.map((t) => t * LOOP);
  const pitches = useMemo(() => buildPitches(hwRatio), [hwRatio]);

  const x = useTransform(
    phase,
    marks,
    X.map((v) => `${v}vw`),
    { ease: EASE_X },
  );
  const y = useTransform(
    phase,
    marks,
    Y.map((v) => `${v}vh`),
    { ease: EASE_Y },
  );
  const rotate = useTransform(phase, marks, pitches, { ease: EASE_PITCH });
  const azimuth = useTransform(phase, marks, AZIMUTH, { ease: EASE_YAW });
  const polar = useTransform(phase, marks, POLAR, { ease: EASE_Y });
  const orbit = useMotionTemplate`${azimuth}deg ${polar}deg 120%`;

  useMotionValueEvent(orbit, 'change', (value) => {
    viewerRef.current?.setAttribute('camera-orbit', value);
  });

  if (!isClient || prefersReducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute will-change-transform"
        style={{ x, y, rotate }}
      >
        <model-viewer
          ref={viewerRef}
          src="/models/plane.glb"
          alt=""
          autoplay
          camera-orbit="315deg 78deg 120%"
          orientation="0deg 6deg 0deg"
          interpolation-decay="0"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto auto"
          interaction-prompt="none"
          shadow-intensity="0"
          exposure="1.1"
          loading="eager"
          className="h-36 w-64 md:h-44 md:w-80 lg:h-52 lg:w-[22rem]"
        />
      </motion.div>
    </div>
  );
};
