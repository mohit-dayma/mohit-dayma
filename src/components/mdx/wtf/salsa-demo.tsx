'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  bipartiteEdges,
  bipartitePositions,
  salsaSteps,
  wtfNodes,
} from './data';
import { GraphCanvas } from './graph';
import { StepControls } from './stepper-controls';
import { useStepper } from './use-stepper';

const nodeLabel = (id: string) =>
  wtfNodes.find((node) => node.id === id)?.label ?? `@${id}`;

export const SalsaDemo = () => {
  const { stepIndex, ...controls } = useStepper(salsaSteps.length, 1400);
  const step = salsaSteps[stepIndex];

  const nodes = wtfNodes.filter((node) => bipartitePositions[node.id]);
  const scoreLabels = Object.fromEntries(
    Object.entries({ ...step.hubScores, ...step.authorityScores }).map(
      ([id, score]) => [id, score.toFixed(2)],
    ),
  );

  return (
    <section className="my-8 overflow-hidden rounded-lg border border-line-subtle">
      <div className="border-b border-line-subtle p-4 md:p-5">
        <p className="text-xs font-medium text-muted">
          Interactive algorithm demo
        </p>
        <h4 className="mt-1 text-lg font-medium tracking-tight md:text-xl">
          SALSA &mdash; the two-step walk
        </h4>
        <p className="mt-1 text-sm text-muted">
          Hubs on the left, authorities on the right. Each pass redistributes
          scores across the edges.
        </p>
      </div>

      <div className="p-4 md:p-5">
        <GraphCanvas
          nodes={nodes}
          edges={bipartiteEdges}
          positions={bipartitePositions}
          updated={step.updated}
          labels={scoreLabels}
          className="h-auto w-full"
        />

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          <span>Blue circle = authority (recommendation candidate)</span>
          <span>Amber ring = updated this round</span>
          <span>Number under a node = current score</span>
        </div>
      </div>

      <div className="border-y border-line-subtle bg-surface p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Step {stepIndex + 1} / {salsaSteps.length}: {step.title}
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

      {stepIndex === salsaSteps.length - 1 && (
        <div className="border-t border-line-subtle p-4 text-sm leading-relaxed text-muted md:p-5">
          <span className="text-[11px] font-semibold text-muted">
            Result &mdash; ranked
          </span>
          <p className="mt-2 font-mono text-xs md:text-sm">
            1. @dan &nbsp; 2. @erin &nbsp; 3. @finn
          </p>
        </div>
      )}
    </section>
  );
};
