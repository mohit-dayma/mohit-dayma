'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { StepControls } from '../shared/stepper-controls';
import { useStepper } from '../shared/use-stepper';
import {
  formatHex,
  simulate,
  type CacheConfig,
  type MemoryAccess,
} from './cache-model';
import { Segmented, WidgetFrame } from './widget-frame';

// Every configuration holds 8 lines of 16 bytes (128 bytes total), so only
// the associativity changes between them.
const LINE_SIZE = 16;
const TOTAL_LINES = 8;

type Ways = 1 | 2 | 4 | 8;

const WAY_OPTIONS: { value: Ways; label: string }[] = [
  { value: 1, label: 'Direct-mapped' },
  { value: 2, label: '2-way' },
  { value: 4, label: '4-way' },
  { value: 8, label: 'Fully associative' },
];

type TraceId = 'sequential' | 'reuse' | 'conflict';

interface Trace {
  label: string;
  code: string;
  accesses: MemoryAccess[];
}

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

const conflictTrace = (): MemoryAccess[] =>
  Array.from({ length: 4 }, (_, i) => [
    { address: 0x080 + i * 4, kind: 'read' as const, label: `b[${i}]` },
    { address: 0x100 + i * 4, kind: 'read' as const, label: `c[${i}]` },
    { address: 0x000 + i * 4, kind: 'write' as const, label: `a[${i}]` },
  ]).flat();

const TRACES: Record<TraceId, Trace> = {
  sequential: {
    label: 'Sequential scan',
    code: 'for (i = 0; i < 16; i++) sum += x[i];   // x at 0x000',
    accesses: ints(0x000, 'x', 16, 'read'),
  },
  reuse: {
    label: 'Reuse',
    code: 'for (pass = 0; pass < 3; pass++)\n  for (i = 0; i < 8; i++) sum += x[i];',
    accesses: [0, 1, 2].flatMap(() => ints(0x000, 'x', 8, 'read')),
  },
  conflict: {
    label: 'Conflicting arrays',
    code: 'for (i = 0; i < 4; i++) a[i] = b[i] + c[i];\n// a at 0x000, b at 0x080, c at 0x100',
    accesses: conflictTrace(),
  },
};

const TRACE_OPTIONS = (Object.keys(TRACES) as TraceId[]).map((id) => ({
  value: id,
  label: TRACES[id].label,
}));

interface SimulatorViewProps {
  config: CacheConfig;
  trace: Trace;
}

const SimulatorView = ({ config, trace }: SimulatorViewProps) => {
  const steps = useMemo(
    () => simulate(config, trace.accesses),
    [config, trace],
  );
  const { stepIndex, ...controls } = useStepper(steps.length, 900);
  const step = steps[stepIndex];
  const total = trace.accesses.length;

  return (
    <>
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_13rem] md:gap-5 md:p-5">
        <div className="space-y-1.5">
          <div
            className="grid gap-1.5 text-[10px] text-faint"
            style={{
              gridTemplateColumns: `3rem repeat(${config.ways}, minmax(0, 1fr))`,
            }}
          >
            <span />
            {Array.from({ length: config.ways }, (_, way) => (
              <span key={way} className="text-center">
                way {way}
              </span>
            ))}
          </div>
          {step.lines.map((set, setIndex) => (
            <div
              key={setIndex}
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `3rem repeat(${config.ways}, minmax(0, 1fr))`,
              }}
            >
              <span
                className={`self-center font-mono text-[11px] ${
                  step.parts?.set === setIndex ? 'text-amber-400' : 'text-faint'
                }`}
              >
                set {setIndex}
              </span>
              {set.map((line, way) => {
                const active = step.parts?.set === setIndex && step.way === way;
                const border = active
                  ? step.outcome === 'hit'
                    ? 'border-emerald-400'
                    : 'border-amber-400'
                  : 'border-line-subtle';
                return (
                  <div
                    key={way}
                    className={`min-w-0 rounded border px-1 py-1.5 text-center font-mono text-[10px] transition-colors md:text-[11px] ${border} ${
                      line.valid ? 'bg-surface' : 'bg-background'
                    }`}
                  >
                    {line.valid ? (
                      <>
                        <span className="block truncate">
                          {formatHex(line.lineAddress)}
                        </span>
                        <span
                          className={`block text-[9px] ${
                            line.dirty ? 'text-amber-400' : 'text-faint'
                          }`}
                        >
                          {line.dirty ? 'dirty' : 'clean'}
                        </span>
                      </>
                    ) : (
                      <span className="block py-[7px] text-faint">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-md border border-line-subtle bg-surface p-3 text-xs">
          <pre className="overflow-x-auto whitespace-pre font-mono text-[10px] leading-relaxed text-muted md:text-[11px]">
            {trace.code}
          </pre>
          <div className="grid grid-cols-3 gap-2 border-t border-line-subtle pt-3">
            <div>
              <p className="text-faint">Hits</p>
              <p className="font-mono text-lg text-emerald-400">
                {step.stats.hits}
              </p>
            </div>
            <div>
              <p className="text-faint">Misses</p>
              <p className="font-mono text-lg text-amber-400">
                {step.stats.misses}
              </p>
            </div>
            <div>
              <p className="text-faint">Writebacks</p>
              <p className="font-mono text-lg">{step.stats.writebacks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-line-subtle bg-surface p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Access {stepIndex} / {total}
            {step.outcome && (
              <span
                className={`ml-2 rounded px-1.5 py-0.5 text-[11px] ${
                  step.outcome === 'hit'
                    ? 'bg-emerald-400/15 text-emerald-400'
                    : 'bg-amber-400/15 text-amber-400'
                }`}
              >
                {step.outcome}
              </span>
            )}
          </p>
          <StepControls {...controls} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-3 text-sm text-muted"
          >
            {step.explanation}
          </motion.p>
        </AnimatePresence>
      </div>
    </>
  );
};

export const CacheSimulator = () => {
  const [ways, setWays] = useState<Ways>(1);
  const [traceId, setTraceId] = useState<TraceId>('sequential');

  const config = useMemo<CacheConfig>(
    () => ({ lineSize: LINE_SIZE, sets: TOTAL_LINES / ways, ways }),
    [ways],
  );
  const trace = TRACES[traceId];

  return (
    <WidgetFrame
      eyebrow="Interactive cache simulator"
      title="Step through a tiny cache"
      description="A 128-byte cache with 16-byte lines and LRU replacement. Each element is a 4-byte int. Change the associativity and replay the same loop."
    >
      <div className="flex flex-col gap-3 border-b border-line-subtle p-4 md:p-5">
        <Segmented
          label="Access pattern"
          value={traceId}
          onChange={setTraceId}
          options={TRACE_OPTIONS}
        />
        <Segmented
          label="Associativity"
          value={ways}
          onChange={setWays}
          options={WAY_OPTIONS}
        />
      </div>
      {/* Remount on change so the stepper restarts at the empty cache. */}
      <SimulatorView key={`${traceId}-${ways}`} config={config} trace={trace} />
    </WidgetFrame>
  );
};
