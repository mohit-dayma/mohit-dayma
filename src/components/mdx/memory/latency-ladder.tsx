'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Segmented, WidgetFrame } from './widget-frame';

interface Level {
  name: string;
  cycles: number;
  label: string;
}

// Pentium M figures as quoted in Drepper (2007), section 3.2.
const PAPER_2007: Level[] = [
  { name: 'Register', cycles: 1, label: '≤1' },
  { name: 'L1d', cycles: 3, label: '~3' },
  { name: 'L2', cycles: 14, label: '~14' },
  { name: 'Main memory', cycles: 240, label: '~240' },
];

// Rough figures for a current desktop core at 4–5 GHz. They vary by CPU.
const TYPICAL_TODAY: Level[] = [
  { name: 'Register', cycles: 1, label: '≤1' },
  { name: 'L1d', cycles: 5, label: '~4–5' },
  { name: 'L2', cycles: 15, label: '~14–18' },
  { name: 'L3', cycles: 50, label: '~40–70' },
  { name: 'Main memory', cycles: 350, label: '~300–450' },
];

type Era = 'paper' | 'today';
type Scale = 'linear' | 'log';

export const LatencyLadder = () => {
  const [era, setEra] = useState<Era>('paper');
  const [scale, setScale] = useState<Scale>('linear');

  const levels = era === 'paper' ? PAPER_2007 : TYPICAL_TODAY;
  const max = Math.max(...levels.map((level) => level.cycles));
  const width = (cycles: number) =>
    scale === 'linear'
      ? (cycles / max) * 100
      : (Math.log10(cycles + 1) / Math.log10(max + 1)) * 100;
  const memory = levels[levels.length - 1];

  return (
    <WidgetFrame
      eyebrow="Interactive comparison"
      title="How far away is your data?"
      description="Cost of one load, measured in CPU clock cycles, depending on where the data is found. Switch to a log scale to see the small values."
    >
      <div className="space-y-4 p-4 md:p-5">
        <div className="flex flex-wrap gap-4">
          <Segmented
            label="Hardware"
            value={era}
            onChange={setEra}
            options={[
              { value: 'paper', label: 'Pentium M (paper, 2007)' },
              { value: 'today', label: 'Typical today (approx.)' },
            ]}
          />
          <Segmented
            label="Scale"
            value={scale}
            onChange={setScale}
            options={[
              { value: 'linear', label: 'Linear' },
              { value: 'log', label: 'Log' },
            ]}
          />
        </div>

        <div className="space-y-2.5">
          {levels.map((level) => (
            <div
              key={level.name}
              className="grid grid-cols-[5.5rem_1fr_6.5rem] items-center gap-3 text-xs md:grid-cols-[6.5rem_1fr_7.5rem] md:text-sm"
            >
              <span className="text-muted">{level.name}</span>
              <div className="h-3 overflow-hidden rounded-full bg-surface">
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${Math.max(width(level.cycles), 0.8)}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{
                    backgroundColor:
                      level === memory ? '#f59e0b' : 'var(--color-foreground)',
                  }}
                />
              </div>
              <span className="text-right font-mono">
                {level.label}{' '}
                <span className="text-faint">
                  {level.cycles === 1 ? 'cycle' : 'cycles'}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="rounded-md border border-line-subtle bg-surface px-3 py-2 text-xs leading-relaxed text-muted md:text-sm">
          {era === 'paper'
            ? 'One load from main memory costs as much as about 80 loads from L1d. These are the latencies Intel published for the Pentium M.'
            : 'The gap has not closed. Clock speeds rose faster than DRAM latency fell, so a load from main memory still costs hundreds of cycles. Exact values depend on the CPU and the memory modules.'}
        </p>
      </div>
    </WidgetFrame>
  );
};
