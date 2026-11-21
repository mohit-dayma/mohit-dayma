'use client';

import { useState } from 'react';
import { WidgetFrame } from './widget-frame';

const ROWS = 4;
const COLUMNS = 8;

// Example timings from the paper's 2-3-2-8-T1 module, in memory-bus cycles.
const CL = 2;
const T_RCD = 3;
const T_RP = 2;

type ReadKind = 'row hit' | 'row closed' | 'row conflict';

interface Read {
  row: number;
  column: number;
}

interface LoggedRead extends Read {
  kind: ReadKind;
  cycles: number;
}

const COST: Record<ReadKind, number> = {
  'row hit': CL,
  'row closed': T_RCD + CL,
  'row conflict': T_RP + T_RCD + CL,
};

const FORMULA: Record<ReadKind, string> = {
  'row hit': 'CL',
  'row closed': 'tRCD + CL',
  'row conflict': 'tRP + tRCD + CL',
};

const SEQUENTIAL: Read[] = Array.from({ length: COLUMNS }, (_, column) => ({
  row: 1,
  column,
}));

const SCATTERED: Read[] = [
  { row: 0, column: 1 },
  { row: 2, column: 5 },
  { row: 1, column: 3 },
  { row: 3, column: 0 },
  { row: 0, column: 6 },
  { row: 2, column: 2 },
  { row: 1, column: 7 },
  { row: 3, column: 4 },
];

const replay = (reads: Read[]) => {
  let openRow: number | null = null;
  const log: LoggedRead[] = reads.map((read) => {
    const kind: ReadKind =
      openRow === null
        ? 'row closed'
        : openRow === read.row
          ? 'row hit'
          : 'row conflict';
    openRow = read.row;
    return { ...read, kind, cycles: COST[kind] };
  });
  return { openRow, log };
};

const kindColor: Record<ReadKind, string> = {
  'row hit': 'text-emerald-400',
  'row closed': 'text-sky-400',
  'row conflict': 'text-amber-400',
};

export const DramRowBuffer = () => {
  const [reads, setReads] = useState<Read[]>([]);
  const { openRow, log } = replay(reads);
  const total = log.reduce((sum, read) => sum + read.cycles, 0);
  const last = log.at(-1);

  return (
    <WidgetFrame
      eyebrow="Interactive DRAM bank"
      title="Row hits and row conflicts"
      description="Click cells to read them, or run a preset. A read from the open row is cheap. A read from another row must close the open row first."
    >
      <div className="grid gap-5 p-4 md:grid-cols-[1fr_15rem] md:p-5">
        <div>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `2.5rem repeat(${COLUMNS}, 1fr)` }}
          >
            {Array.from({ length: ROWS }, (_, row) => (
              <div key={row} className="contents">
                <span
                  className={`self-center font-mono text-[11px] ${
                    openRow === row ? 'text-foreground' : 'text-faint'
                  }`}
                >
                  row {row}
                </span>
                {Array.from({ length: COLUMNS }, (_, column) => {
                  const isLast = last?.row === row && last.column === column;
                  return (
                    <button
                      key={column}
                      type="button"
                      aria-label={`Read row ${row}, column ${column}`}
                      onClick={() =>
                        setReads((prev) => [...prev, { row, column }])
                      }
                      className={`h-7 rounded border text-[10px] transition-colors md:h-8 ${
                        isLast
                          ? 'border-foreground bg-foreground text-background'
                          : openRow === row
                            ? 'border-line bg-surface-hover text-muted'
                            : 'border-line-subtle bg-surface text-faint hover:border-line'
                      }`}
                    >
                      {column}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-md border border-dashed border-line px-3 py-2 font-mono text-[11px] text-muted">
            Row buffer:{' '}
            {openRow === null ? 'empty (no row open)' : `row ${openRow} open`}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReads(SEQUENTIAL)}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
            >
              Run 8 sequential reads
            </button>
            <button
              type="button"
              onClick={() => setReads(SCATTERED)}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-medium"
            >
              Run 8 scattered reads
            </button>
            <button
              type="button"
              onClick={() => setReads([])}
              disabled={reads.length === 0}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-md border border-line-subtle bg-surface p-3 text-xs">
          <p className="font-semibold text-muted">
            Timings: CL={CL}, tRCD={T_RCD}, tRP={T_RP}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-faint">Reads</p>
              <p className="font-mono text-lg">{log.length}</p>
            </div>
            <div>
              <p className="text-faint">Bus cycles</p>
              <p className="font-mono text-lg">{total}</p>
            </div>
          </div>
          <ol className="mt-3 max-h-48 space-y-1 overflow-y-auto font-mono text-[11px]">
            {log.length === 0 && <li className="text-faint">No reads yet.</li>}
            {log
              .map((read, index) => ({ read, index }))
              .reverse()
              .map(({ read, index }) => (
                <li key={index} className="flex justify-between gap-2">
                  <span className="text-muted">
                    r{read.row}c{read.column}{' '}
                    <span className={kindColor[read.kind]}>{read.kind}</span>
                  </span>
                  <span title={FORMULA[read.kind]}>+{read.cycles}</span>
                </li>
              ))}
          </ol>
        </div>
      </div>

      <p className="border-t border-line-subtle bg-surface px-4 py-3 text-xs leading-relaxed text-muted md:px-5 md:text-sm">
        {last
          ? `Last read: ${last.kind}, ${FORMULA[last.kind]} = ${last.cycles} cycles. Average so far: ${(total / log.length).toFixed(1)} cycles per read.`
          : 'Eight reads from one row cost 5 + 7 × 2 = 19 cycles. Eight reads that change rows every time cost 5 + 7 × 7 = 54 cycles.'}
      </p>
    </WidgetFrame>
  );
};
