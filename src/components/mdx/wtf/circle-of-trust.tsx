'use client';

import { AnimatePresence, motion } from 'motion/react';
import { mainPositions, walkSteps, wtfEdges, wtfNodes } from './data';
import { GraphCanvas } from './graph';
import { StepControls } from './stepper-controls';
import { useStepper } from './use-stepper';

const nodeLabel = (id: string) =>
  wtfNodes.find((node) => node.id === id)?.label ?? `@${id}`;

export const CircleOfTrust = () => {
  const { stepIndex, ...controls } = useStepper(walkSteps.length);
  const step = walkSteps[stepIndex];

  const counts = Object.entries(step.visitedCounts).filter(
    ([id]) => id !== 'you',
  );
  const maxCount = Math.max(...counts.map(([, count]) => count), 1);

  return (
    <section className="my-8 overflow-hidden rounded-lg border border-line-subtle">
      <div className="border-b border-line-subtle p-4 md:p-5">
        <p className="text-xs font-medium text-muted">
          Interactive algorithm demo
        </p>
        <h4 className="mt-1 text-lg font-medium tracking-tight md:text-xl">
          Random walk &rarr; circle of trust
        </h4>
        <p className="mt-1 text-sm text-muted">
          A walker hops from @you to a random follow, tallying every visit.
        </p>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 md:gap-5 md:p-5">
        <GraphCanvas
          nodes={wtfNodes}
          edges={wtfEdges}
          positions={mainPositions}
          activeNode={step.currentNode}
          highlighted={step.circleOfTrust}
          className="h-auto w-full"
        />

        <div className="rounded-md border border-line-subtle bg-surface p-3">
          <p className="text-[11px] font-semibold text-muted">Visits so far</p>
          <div className="mt-3 space-y-2">
            {counts.map(([id, count]) => (
              <div
                key={id}
                className="flex items-center gap-2 text-xs md:text-sm"
              >
                <span className="w-14 shrink-0 font-mono">{nodeLabel(id)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      backgroundColor: step.circleOfTrust.includes(id)
                        ? 'var(--color-foreground)'
                        : 'var(--color-line)',
                    }}
                  />
                </div>
                <span className="w-4 shrink-0 text-right font-mono text-muted">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-y border-line-subtle bg-surface p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Step {stepIndex + 1} / {walkSteps.length}: {step.title}
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
