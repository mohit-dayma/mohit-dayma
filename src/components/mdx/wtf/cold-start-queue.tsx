'use client';

import { AnimatePresence, motion } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import { queueSteps, wtfNodes } from './data';
import { StepControls } from './stepper-controls';
import { useStepper } from './use-stepper';

const nodeLabel = (id: string) =>
  wtfNodes.find((node) => node.id === id)?.label ?? `@${id}`;

export const ColdStartQueue = () => {
  const { stepIndex, ...controls } = useStepper(queueSteps.length);
  const step = queueSteps[stepIndex];

  return (
    <section className="my-8 overflow-hidden rounded-lg border border-line-subtle">
      <div className="border-b border-line-subtle p-4 md:p-5">
        <p className="text-xs font-medium text-muted">
          Interactive system demo
        </p>
        <h4 className="mt-1 text-lg font-medium tracking-tight md:text-xl">
          The cold-start queue
        </h4>
        <p className="mt-1 text-sm text-muted">
          Users wait to be refreshed. New users jump the line.
        </p>
      </div>

      <div className="p-4 md:p-5">
        <div className="rounded-md border border-line-subtle bg-surface p-3">
          <p className="text-[11px] font-semibold text-muted">
            Refresh queue &mdash; front first
          </p>

          <div className="mt-2 space-y-2">
            <AnimatePresence initial={false} mode="popLayout">
              {step.queue.map((id, index) => {
                const isNext = index === 0;
                const isHighlighted = id === step.highlight;
                return (
                  <motion.div
                    layout
                    key={id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className={twMerge(
                      'flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium md:text-sm',
                      isNext && 'border-foreground',
                      isHighlighted && 'border-amber-500 bg-amber-500/10',
                      !isNext && !isHighlighted && 'border-line-subtle',
                    )}
                  >
                    <span>{nodeLabel(id)}</span>
                    <span className="font-mono text-[10px] text-muted">
                      {isNext ? 'NEXT' : `#${index + 1}`}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="border-y border-line-subtle bg-surface p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Step {stepIndex + 1} / {queueSteps.length}: {step.title}
          </p>
          <StepControls {...controls} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mt-3 text-sm text-muted"
          >
            {step.explanation}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
};
