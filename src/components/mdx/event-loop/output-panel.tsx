'use client';

import { useMemo, useState } from 'react';
import { OutputQuiz } from './output-quiz';

interface OutputPanelProps {
  expectedOrder: string[];
}

export const OutputPanel = ({ expectedOrder }: OutputPanelProps) => {
  const [mode, setMode] = useState<'practice' | 'expected'>('practice');

  const orderPreview = useMemo(
    () =>
      expectedOrder.map((entry, index) => `${index + 1}. ${entry}`).join('\n'),
    [expectedOrder],
  );

  const isPractice = mode === 'practice';

  return (
    <div className="rounded-lg border border-line-subtle bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Output Challenge
        </p>
        <div className="inline-flex rounded-md border border-line-subtle bg-surface p-0.5">
          <button
            type="button"
            aria-pressed={isPractice}
            onClick={() => setMode('practice')}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
              isPractice
                ? 'bg-surface-hover text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Practice
          </button>
          <button
            type="button"
            aria-pressed={!isPractice}
            onClick={() => setMode('expected')}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
              !isPractice
                ? 'bg-surface-hover text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Show Expected
          </button>
        </div>
      </div>

      {isPractice ? (
        <OutputQuiz expectedOrder={expectedOrder} embedded />
      ) : (
        <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/90 md:text-sm">
          {orderPreview}
        </pre>
      )}
    </div>
  );
};
