import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
// The blog's own cache model, so the video shows exactly what the widget shows.
import {
  simulate,
  type CacheConfig,
  type CacheLine,
  type CacheStep,
  type MemoryAccess,
} from '../../src/components/mdx/memory/cache-model';
import { color, mono, sans } from './theme';

const SCENES = {
  hook: { from: 0, duration: 120 },
  ladder: { from: 120, duration: 285 },
  cache: { from: 405, duration: 375 },
  outro: { from: 780, duration: 150 },
};

export const TEASER_DURATION = SCENES.outro.from + SCENES.outro.duration;

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Fades a scene in and out over its first and last few frames. */
const Fade = ({
  children,
  duration,
}: {
  children: ReactNode;
  duration: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, duration - 12, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Fades and lifts an element in, starting at `delay` frames. */
const Rise = ({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
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

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 26,
      letterSpacing: 4,
      textTransform: 'uppercase',
      color: color.faint,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ Hook */

const Hook = () => (
  <AbsoluteFill
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      gap: 28,
      fontFamily: sans,
    }}
  >
    <Rise delay={6}>
      <div style={{ fontSize: 110, fontWeight: 600, color: color.foreground }}>
        Your CPU is fast.
      </div>
    </Rise>
    <Rise delay={42}>
      <div style={{ fontSize: 110, fontWeight: 600, color: color.amber }}>
        Memory is not.
      </div>
    </Rise>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- Ladder */

// Pentium M figures as quoted in Drepper (2007), section 3.2.
const LEVELS = [
  { name: 'Register', cycles: 1 },
  { name: 'L1d', cycles: 3 },
  { name: 'L2', cycles: 14 },
  { name: 'Main memory', cycles: 240 },
];

const Ladder = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = LEVELS[LEVELS.length - 1].cycles;

  return (
    <AbsoluteFill style={{ padding: '140px 180px', fontFamily: sans, gap: 24 }}>
      <Rise>
        <Eyebrow>Cost of one load, in CPU cycles</Eyebrow>
      </Rise>
      <Rise delay={6}>
        <div style={{ fontSize: 76, fontWeight: 600, color: color.foreground }}>
          How far away is your data?
        </div>
      </Rise>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          marginTop: 70,
        }}
      >
        {LEVELS.map((level, i) => {
          const isMemory = i === LEVELS.length - 1;
          // Memory arrives last and slowest, to make the wait felt.
          const start = 30 + i * 22 + (isMemory ? 20 : 0);
          const grow = spring({
            frame: frame - start,
            fps,
            config: { damping: 200 },
            durationInFrames: isMemory ? 75 : 25,
          });
          const width = Math.max((level.cycles / max) * 100, 0.7) * grow;
          const shown = Math.round(level.cycles * grow);

          return (
            <div
              key={level.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr 260px',
                alignItems: 'center',
                gap: 36,
                opacity: interpolate(frame - start, [-8, 0], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  color: isMemory ? color.foreground : color.muted,
                }}
              >
                {level.name}
              </span>
              <div
                style={{
                  height: 30,
                  borderRadius: 999,
                  background: color.surface,
                  border: `1px solid ${color.lineSubtle}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${width}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: isMemory ? color.amber : color.foreground,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 40,
                  textAlign: 'right',
                  color: isMemory ? color.amber : color.foreground,
                }}
              >
                ~{shown}
                <span style={{ color: color.faint, fontSize: 28 }}> cyc</span>
              </span>
            </div>
          );
        })}
      </div>

      <Rise delay={200} style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 48, color: color.muted }}>
          One trip to main memory ≈{' '}
          <span style={{ color: color.amber, fontWeight: 600 }}>
            80 loads from L1d
          </span>
          .
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 24,
            color: color.faint,
            marginTop: 14,
          }}
        >
          Pentium M latencies · Drepper, “What Every Programmer Should Know
          About Memory” (2007)
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------------- Cache */

// The "Conflicting arrays" trace from the blog's cache simulator:
// for (i = 0; i < 4; i++) a[i] = b[i] + c[i];   a at 0x000, b at 0x080, c at 0x100
const TRACE: MemoryAccess[] = Array.from({ length: 4 }, (_, i) => [
  { address: 0x080 + i * 4, kind: 'read' as const, label: `b[${i}]` },
  { address: 0x100 + i * 4, kind: 'read' as const, label: `c[${i}]` },
  { address: 0x000 + i * 4, kind: 'write' as const, label: `a[${i}]` },
]).flat();

// Both caches hold 8 lines of 16 bytes (128 B). Only associativity differs.
const DIRECT: CacheConfig = { lineSize: 16, sets: 8, ways: 1 };
const FOUR_WAY: CacheConfig = { lineSize: 16, sets: 2, ways: 4 };
const DIRECT_STEPS = simulate(DIRECT, TRACE);
const FOUR_WAY_STEPS = simulate(FOUR_WAY, TRACE);

const STEP_START = 75;
const STEP_FRAMES = 17;
const STEPS_END = STEP_START + TRACE.length * STEP_FRAMES;

const arrayName = (line: CacheLine) =>
  line.lineAddress >= 0x100 ? 'c' : line.lineAddress >= 0x080 ? 'b' : 'a';

const CacheGrid = ({
  title,
  config,
  step,
  local,
}: {
  title: string;
  config: CacheConfig;
  step: CacheStep;
  /** Frames since this step began, for the flash on the touched slot. */
  local: number;
}) => {
  const flash = interpolate(local, [0, 4, STEP_FRAMES], [0, 1, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const accent = step.outcome === 'hit' ? color.hit : color.miss;
  const cellW = config.ways === 1 ? 300 : 170;
  const cellH = config.sets === 8 ? 44 : 94;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span
          style={{ fontSize: 38, fontWeight: 600, color: color.foreground }}
        >
          {title}
        </span>
        <span style={{ fontFamily: mono, fontSize: 22, color: color.faint }}>
          {config.sets} sets × {config.ways} way{config.ways === 1 ? '' : 's'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {step.lines.map((set, s) => (
          <div
            key={s}
            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 20,
                color: color.faint,
                width: 70,
              }}
            >
              set {s}
            </span>
            {set.map((line, w) => {
              const touched = step.parts?.set === s && step.way === w;
              return (
                <div
                  key={w}
                  style={{
                    width: cellW,
                    height: cellH,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontFamily: mono,
                    fontSize: 24,
                    color: line.valid ? color.foreground : color.faint,
                    background: touched
                      ? `color-mix(in srgb, ${accent} ${Math.round(flash * 28)}%, ${color.surface})`
                      : color.surface,
                    border: `2px solid ${touched ? accent : color.lineSubtle}`,
                  }}
                >
                  {line.valid ? `${arrayName(line)}[0..3]` : '—'}
                  {line.dirty && (
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 99,
                        background: color.amber,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 40,
          fontFamily: mono,
          fontSize: 32,
          marginTop: 6,
        }}
      >
        <span style={{ color: color.hit }}>{step.stats.hits} hits</span>
        <span style={{ color: color.miss }}>{step.stats.misses} misses</span>
      </div>
    </div>
  );
};

const Cache = () => {
  const frame = useCurrentFrame();
  const index = Math.max(
    0,
    Math.min(TRACE.length, Math.floor((frame - STEP_START) / STEP_FRAMES) + 1),
  );
  const local = frame - STEP_START - (index - 1) * STEP_FRAMES;
  const current = TRACE[index - 1];

  return (
    <AbsoluteFill
      style={{ padding: '56px 140px', fontFamily: sans, alignItems: 'center' }}
    >
      <Rise>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: color.foreground,
            textAlign: 'center',
          }}
        >
          Same cache size. Very different result.
        </div>
      </Rise>
      <Rise delay={10}>
        <div
          style={{
            marginTop: 18,
            fontFamily: mono,
            fontSize: 32,
            color: color.muted,
            padding: '14px 28px',
            borderRadius: 12,
            border: `1px solid ${color.lineSubtle}`,
            background: color.surface,
          }}
        >
          for (i = 0; i &lt; 4; i++) a[i] = b[i] + c[i];
          <span style={{ color: color.faint }}>
            {'   // a, b, c are 128 B apart'}
          </span>
        </div>
      </Rise>

      <div
        style={{
          height: 50,
          marginTop: 18,
          fontFamily: mono,
          fontSize: 32,
          color: color.muted,
        }}
      >
        {current && (
          <>
            {current.kind === 'read' ? 'read ' : 'write '}
            <span style={{ color: color.foreground }}>{current.label}</span>
          </>
        )}
      </div>

      <Rise
        delay={30}
        style={{
          display: 'flex',
          gap: 160,
          marginTop: 6,
          alignItems: 'flex-start',
        }}
      >
        <CacheGrid
          title="Direct-mapped"
          config={DIRECT}
          step={DIRECT_STEPS[index]}
          local={local}
        />
        <CacheGrid
          title="4-way"
          config={FOUR_WAY}
          step={FOUR_WAY_STEPS[index]}
          local={local}
        />
      </Rise>

      <Rise delay={STEPS_END + 12} style={{ position: 'absolute', bottom: 48 }}>
        <div style={{ fontSize: 38, color: color.muted, textAlign: 'center' }}>
          Direct-mapped: all three arrays fight over{' '}
          <span style={{ color: color.miss, fontWeight: 600 }}>set 0</span>.
          4-way: they{' '}
          <span style={{ color: color.hit, fontWeight: 600 }}>share it</span>.
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------------- Outro */

const Outro = () => (
  <AbsoluteFill
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      gap: 30,
      fontFamily: sans,
    }}
  >
    <Rise>
      <Eyebrow>Memory Series · Part 1</Eyebrow>
    </Rise>
    <Rise delay={8}>
      <div style={{ fontSize: 120, fontWeight: 700, color: color.foreground }}>
        How CPU Caches Work
      </div>
    </Rise>
    <Rise delay={22}>
      <div style={{ fontSize: 40, color: color.muted }}>
        An interactive guide ·{' '}
        <span style={{ color: color.amber }}>mohitd.com/blog</span>
      </div>
    </Rise>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- Teaser */

const SCENE_COMPONENTS = {
  hook: Hook,
  ladder: Ladder,
  cache: Cache,
  outro: Outro,
};

export const Teaser = () => (
  <AbsoluteFill style={{ background: color.background }}>
    {(Object.keys(SCENES) as (keyof typeof SCENES)[]).map((key) => {
      const { from, duration } = SCENES[key];
      const Scene = SCENE_COMPONENTS[key];
      return (
        <Sequence key={key} from={from} durationInFrames={duration}>
          <Fade duration={duration}>
            <Scene />
          </Fade>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
