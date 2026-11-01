'use client';

import { useState } from 'react';

const CAPACITY = 40;
const MAX = 100;

export const MemoryDecision = () => {
  const [size, setSize] = useState(20);

  const fits = size <= CAPACITY;
  const ramPct = Math.min(100, (size / CAPACITY) * 100);
  const shards = Math.max(1, Math.ceil(size / CAPACITY));

  return (
    <section className="my-8 overflow-hidden rounded-lg border border-line-subtle">
      <div className="border-b border-line-subtle p-4 md:p-5">
        <p className="text-xs font-medium text-muted">
          Interactive design decision
        </p>
        <h4 className="mt-1 text-lg font-medium tracking-tight md:text-xl">
          One machine, or many?
        </h4>
        <p className="mt-1 text-sm text-muted">
          WTF chose a single in-memory server. Move the slider to grow the graph
          and to see the design break.
        </p>
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Graph size</span>
          <span className="font-mono">{size}M accounts</span>
        </div>
        <input
          type="range"
          min={1}
          max={MAX}
          value={size}
          onChange={(event) => setSize(Number(event.target.value))}
          className="mt-2 w-full accent-foreground"
          aria-label="Graph size in millions of accounts"
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-line-subtle bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Single in-memory server</p>
              <span className="rounded border border-line px-2 py-0.5 text-[10px] font-medium text-muted">
                chosen in 2010
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>RAM used</span>
                <span>capacity &asymp;{CAPACITY}M</span>
              </div>
              <div className="relative mt-1 h-3 overflow-hidden rounded-full border border-line-subtle bg-background">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${ramPct}%`,
                    backgroundColor: fits
                      ? 'var(--color-foreground)'
                      : '#d97706',
                  }}
                />
              </div>
            </div>

            <p
              className={`mt-3 text-sm font-medium ${
                fits ? '' : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {fits
                ? 'Fits in RAM — queries are microsecond in-memory reads.'
                : "Out of memory — the graph exceeds one server's RAM."}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Simple to build and debug, millisecond latency. But it has a hard
              ceiling: when RAM runs out, you are stuck.
            </p>
          </div>

          <div className="rounded-md border border-line-subtle bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Distributed cluster</p>
              <span className="rounded border border-line px-2 py-0.5 text-[10px] font-medium text-muted">
                industry default
              </span>
            </div>

            <p className="mt-3 font-mono text-sm">
              {shards} server{shards === 1 ? '' : 's'}
            </p>
            <p className="mt-2 text-sm font-medium">
              Scales with the graph &mdash; add machines as it grows.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              But it adds partitioning, replication, coordination, and network
              latency. More moving parts to fail.
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-md border border-line-subtle bg-surface px-3 py-2 text-xs leading-relaxed text-muted md:text-sm">
          {fits
            ? `At ${size}M accounts the single machine still wins: simpler to build, deploy, and debug. That is the decision WTF made.`
            : `At ${size}M accounts the single machine breaks. WTF's second generation moved the graph to a distributed stack (Hadoop + machine learning).`}
        </p>
      </div>
    </section>
  );
};
