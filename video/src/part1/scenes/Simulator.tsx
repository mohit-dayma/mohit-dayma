import { interpolate } from 'remotion';
import { clamp, Eyebrow, Reveal } from '../../shared/anim';
import { CacheGrid } from '../../shared/CacheGrid';
import {
  simulate,
  type CacheConfig,
  type CacheLine,
  type MemoryAccess,
} from '../../../../src/components/mdx/memory/cache-model';
import { color, mono } from '../../theme';
import { stepAt, useCues, type Cues } from '../cues';
import { Cite, Heading, Layer, Panel, Strong } from '../ui';

// Same traces and sizes as the blog's cache simulator: 8 lines of 16 bytes.
const LINE_SIZE = 16;
const TOTAL_LINES = 8;

const ints = (
  base: number,
  name: string,
  count: number,
  kind: 'read' | 'write',
) =>
  Array.from({ length: count }, (_, i) => ({
    address: base + i * 4,
    kind,
    label: `${name}[${i}]`,
  }));

const TRACES = {
  sequential: {
    code: 'for (i = 0; i < 16; i++) sum += x[i];',
    accesses: ints(0x000, 'x', 16, 'read'),
  },
  reuse: {
    code: 'for (pass = 0; pass < 3; pass++)\n  for (i = 0; i < 8; i++) sum += x[i];',
    accesses: [0, 1, 2].flatMap(() => ints(0x000, 'x', 8, 'read')),
  },
  conflict: {
    code: 'for (i = 0; i < 4; i++) a[i] = b[i] + c[i];\n// a at 0x000, b at 0x080, c at 0x100',
    accesses: Array.from({ length: 4 }, (_, i) => [
      { address: 0x080 + i * 4, kind: 'read' as const, label: `b[${i}]` },
      { address: 0x100 + i * 4, kind: 'read' as const, label: `c[${i}]` },
      { address: 0x000 + i * 4, kind: 'write' as const, label: `a[${i}]` },
    ]).flat(),
  },
} satisfies Record<string, { code: string; accesses: MemoryAccess[] }>;

type TraceId = keyof typeof TRACES;

const config = (ways: number): CacheConfig => ({
  lineSize: LINE_SIZE,
  sets: TOTAL_LINES / ways,
  ways,
});

const WAY_NAMES: Record<number, string> = {
  1: 'Direct-mapped',
  2: '2-way',
  4: '4-way',
};

const GRID_SIZE: Record<number, { w: number; h: number }> = {
  1: { w: 360, h: 46 },
  2: { w: 250, h: 94 },
  4: { w: 170, h: 150 },
};

interface Phase {
  from: string;
  until: string | null;
  trace: TraceId;
  ways: number;
  /** Cue whose start begins the replay. */
  runFrom: string;
  /** Cue whose end (times `fraction`) finishes the replay. */
  runTo: string;
  fraction?: number;
  result?: { cue: string; text: string; good: boolean };
}

const PHASES: Phase[] = [
  {
    from: 'setup',
    until: 'seq',
    trace: 'sequential',
    ways: 1,
    runFrom: 'seq',
    runTo: 'seq',
    fraction: 0,
  },
  {
    from: 'seq',
    until: 'reuse',
    trace: 'sequential',
    ways: 1,
    runFrom: 'seqrun',
    runTo: 'seqrun',
    result: {
      cue: 'seqres',
      text: '4 misses · 12 hits — spatial locality',
      good: true,
    },
  },
  {
    from: 'reuse',
    until: 'conf',
    trace: 'reuse',
    ways: 1,
    runFrom: 'reuse',
    runTo: 'reuserun',
    result: {
      cue: 'reuseres',
      text: '2 misses, then hits — temporal locality',
      good: true,
    },
  },
  {
    from: 'conf',
    until: 'conf2',
    trace: 'conflict',
    ways: 1,
    runFrom: 'confdm',
    runTo: 'confdm',
    result: { cue: 'confdmres', text: '12 accesses · 12 misses', good: false },
  },
  {
    from: 'conf2',
    until: 'conf4',
    trace: 'conflict',
    ways: 2,
    runFrom: 'conf2',
    runTo: 'conf2',
    result: {
      cue: 'conf2',
      text: '3 lines, 2 ways: still 12 misses',
      good: false,
    },
  },
  {
    from: 'conf4',
    until: 'paper',
    trace: 'conflict',
    ways: 4,
    runFrom: 'conf4',
    runTo: 'conf4res',
    fraction: 0.5,
    result: {
      cue: 'conf4res',
      text: '3 misses · 9 hits — same capacity',
      good: true,
    },
  },
];

const STEPS = new Map(
  PHASES.map((p) => [
    `${p.trace}-${p.ways}`,
    simulate(config(p.ways), TRACES[p.trace].accesses),
  ]),
);

const labelFor = (trace: TraceId) => (line: CacheLine) => {
  if (trace !== 'conflict')
    return `x[${line.lineAddress / 4}..${line.lineAddress / 4 + 3}]`;
  const name =
    line.lineAddress >= 0x100 ? 'c' : line.lineAddress >= 0x080 ? 'b' : 'a';
  return `${name}[0..3]`;
};

const SimPhase = ({ phase, c }: { phase: Phase; c: Cues }) => {
  const trace = TRACES[phase.trace];
  const steps = STEPS.get(`${phase.trace}-${phase.ways}`)!;
  const total = trace.accesses.length;
  const start = c.at(phase.runFrom) + 8;
  const stop =
    c.at(phase.runTo) +
    (c.end(phase.runTo) - c.at(phase.runTo)) * (phase.fraction ?? 1);
  const progress = interpolate(
    c.frame,
    [start, Math.max(stop, start + 1)],
    [0, 1],
    clamp,
  );
  const index = phase.fraction === 0 ? 0 : stepAt(progress, total);
  const stepFrames = Math.max(1, (stop - start) / total);
  const local = c.frame - (start + (index - 1) * stepFrames);
  const step = steps[index];
  const size = GRID_SIZE[phase.ways];
  const showResult =
    phase.result && c.reached(phase.result.cue) && index === total;

  return (
    <Layer t={c.phase(phase.from, phase.until)}>
      <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
        <div style={{ width: 760, flexShrink: 0 }}>
          <Eyebrow>{WAY_NAMES[phase.ways]} · 8 lines × 16 B = 128 B</Eyebrow>
          <Panel style={{ marginTop: 24, padding: '22px 28px' }}>
            <pre
              style={{
                margin: 0,
                fontFamily: mono,
                fontSize: 26,
                color: color.muted,
                whiteSpace: 'pre-wrap',
              }}
            >
              {trace.code}
            </pre>
          </Panel>
          <div
            style={{
              marginTop: 30,
              fontFamily: mono,
              fontSize: 36,
              height: 50,
              color: color.muted,
            }}
          >
            {step.access ? (
              <>
                {step.access.kind}{' '}
                <span style={{ color: color.foreground }}>
                  {step.access.label}
                </span>
                {' → '}
                <span
                  style={{
                    color: step.outcome === 'hit' ? color.hit : color.miss,
                  }}
                >
                  {step.outcome}
                </span>
              </>
            ) : (
              <span style={{ color: color.faint }}>cache empty</span>
            )}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 24,
              color: color.faint,
              marginTop: 6,
            }}
          >
            step {index} / {total}
          </div>
          {phase.result && (
            <Reveal
              t={showResult ? c.on(phase.result.cue, 14) : 0}
              style={{ marginTop: 34 }}
            >
              <Panel accent={phase.result.good ? color.hit : color.miss}>
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 600,
                    color: phase.result.good ? color.hit : color.miss,
                  }}
                >
                  {phase.result.text}
                </div>
              </Panel>
            </Reveal>
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <CacheGrid
            config={config(phase.ways)}
            step={step}
            local={local}
            stepFrames={stepFrames}
            lineLabel={labelFor(phase.trace)}
            cellW={size.w}
            cellH={size.h}
            fontSize={phase.ways === 4 ? 22 : 24}
            showWritebacks={phase.trace === 'conflict'}
          />
        </div>
      </div>
    </Layer>
  );
};

export const Simulator = () => {
  const c = useCues();

  return (
    <>
      {PHASES.map((phase) => (
        <SimPhase key={phase.from} phase={phase} c={c} />
      ))}

      <Layer t={c.phase('paper')}>
        <Heading>How much does associativity help?</Heading>
        <div style={{ fontSize: 32, color: color.muted, marginTop: 18 }}>
          L2 misses for a gcc compile, simulated in the paper
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            marginTop: 50,
          }}
        >
          <Reveal t={c.on('paper', 18, 60)}>
            <Panel accent={color.hit}>
              <div style={{ fontSize: 40 }}>
                8 MB cache, direct-mapped → 2-way:{' '}
                <Strong c={color.hit}>almost 44% fewer misses</Strong>
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('paper2')}>
            <Panel>
              <div style={{ fontSize: 40, color: color.muted }}>
                Each further doubling helps less. <Strong>Above 8 ways</Strong>:
                small gains for one thread.
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('shared')}>
            <Panel accent={color.amber}>
              <div style={{ fontSize: 40, color: color.muted }}>
                Shared cache: 2 threads on 8 ways ≈{' '}
                <Strong c={color.amber}>4 ways each</Strong>. Shared caches need
                more ways.
              </div>
            </Panel>
          </Reveal>
        </div>
        <Cite>Drepper (2007), §3.3.1, Table 3.1 and Figure 3.8</Cite>
      </Layer>
    </>
  );
};
