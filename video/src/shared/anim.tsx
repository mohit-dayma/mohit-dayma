import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { color, mono } from '../theme';

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/** 0 → 1 over `length` frames, starting at `start`, eased. */
export const ramp = (frame: number, start: number, length = 18) =>
  interpolate(frame - start, [0, length], [0, 1], { ...clamp, easing: ease });

/** Fades a scene in and out over its first and last few frames. */
export const Fade = ({
  children,
  duration,
  edge = 12,
}: {
  children: ReactNode;
  duration: number;
  edge?: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, edge, duration - edge, duration],
    [0, 1, 1, 0],
    clamp,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Fades and lifts an element in, starting at `delay` frames. */
export const Rise = ({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay);
  return (
    <div
      style={{
        opacity: t,
        transform: `translateY(${(1 - t) * 24}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Like Rise, but driven by a 0–1 value instead of the frame. */
export const Reveal = ({
  t,
  children,
  style,
}: {
  t: number;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      opacity: t,
      transform: `translateY(${(1 - t) * 24}px)`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Eyebrow = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 26,
      letterSpacing: 4,
      textTransform: 'uppercase',
      color: color.faint,
      ...style,
    }}
  >
    {children}
  </div>
);
