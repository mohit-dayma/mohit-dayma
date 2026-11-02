'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { OutputPanel } from './event-loop/output-panel';
import { QueueCard } from './event-loop/queue-card';
import { complexScenario } from './event-loop/scenarios/complex-scenario';
import { simpleScenario } from './event-loop/scenarios/simple-scenario';
import { timeoutScenario } from './event-loop/scenarios/timeout-scenario';
import type { EventLoopSimulatorProps } from './event-loop/types';

const AUTOPLAY_INTERVAL_MS = 1200;

export const EventLoopSimulator = ({
  title,
  subtitle,
  code,
  expectedOrder,
  steps,
}: EventLoopSimulatorProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const currentStep = steps.length > 0 ? steps[stepIndex] : null;
  const isLastStep = steps.length === 0 || stepIndex === steps.length - 1;

  const canGoBack = stepIndex > 0;
  const canGoNext = !isLastStep;

  useEffect(() => {
    if (!isAutoplay || isLastStep) {
      return;
    }

    const timer = window.setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsAutoplay(false);
          window.clearInterval(timer);
          return prev;
        }

        const next = prev + 1;
        if (next >= steps.length - 1) {
          setIsAutoplay(false);
        }
        return next;
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isAutoplay, isLastStep, steps.length]);

  const stopAutoplay = () => setIsAutoplay(false);

  const handleReset = () => {
    stopAutoplay();
    setStepIndex(0);
  };

  const handlePrevious = () => {
    stopAutoplay();
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    stopAutoplay();
    setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const toggleAutoplay = () => {
    if (steps.length === 0) {
      setIsAutoplay(false);
      return;
    }

    if (!isAutoplay && isLastStep) {
      setStepIndex(0);
      setIsAutoplay(true);
      return;
    }

    setIsAutoplay((prev) => !prev);
  };

  if (!currentStep) {
    return (
      <section className="my-8 overflow-hidden rounded-lg border border-line-subtle bg-surface">
        <div className="border-b border-line-subtle p-4 md:p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Interactive Event Loop Demo
          </p>
          <h4 className="mt-1 text-lg font-semibold text-white md:text-xl">
            {title}
          </h4>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="p-4 text-center text-sm text-muted md:p-5">
          No steps available for this scenario.
        </div>
      </section>
    );
  }

  return (
    <section className="my-8 overflow-hidden rounded-lg border border-line-subtle bg-surface">
      <div className="border-b border-line-subtle p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          Interactive Event Loop Demo
        </p>
        <h4 className="mt-1 text-lg font-semibold text-white md:text-xl">
          {title}
        </h4>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 md:gap-5 md:p-5">
        <div className="rounded-lg border border-line-subtle bg-surface p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Code
          </p>
          <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-white/90 md:text-sm">
            <code>{code}</code>
          </pre>
        </div>

        <div>
          <OutputPanel expectedOrder={expectedOrder} />
        </div>
      </div>

      <div className="border-y border-line-subtle bg-surface p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`title-${stepIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="text-sm font-semibold text-white"
            >
              Step {stepIndex + 1} / {steps.length}: {currentStep.title}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canGoBack}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handlePrevious}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canGoBack}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canGoNext}
            >
              Next Step
            </button>
            <button
              type="button"
              onClick={toggleAutoplay}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
            >
              {isAutoplay ? 'Pause' : 'Autoplay'}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`desc-${stepIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mt-3 text-sm text-muted"
          >
            {currentStep.explanation}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-3 md:gap-4 md:p-5">
        <QueueCard
          title="Call Stack (Top First)"
          items={currentStep.stack}
          emptyLabel="Call stack is empty"
        />
        <QueueCard
          title="Microtask Queue (Front First)"
          items={currentStep.microtaskQueue.map((item) => item.label)}
          emptyLabel="No microtasks waiting"
        />
        <QueueCard
          title="Task Queue (Front First)"
          items={currentStep.taskQueue.map((item) => item.label)}
          emptyLabel="No tasks waiting"
        />
      </div>

      <div className="border-t border-line-subtle p-4 md:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Console Output So Far
        </p>

        <div className="mt-2 rounded-lg border border-line-subtle bg-surface p-3">
          <AnimatePresence mode="wait" initial={false}>
            {currentStep.output.length ? (
              <motion.ol
                key={`output-${stepIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-1 text-sm text-white/90"
              >
                {currentStep.output.map((line, index) => (
                  <li key={`${line}-${index}`}>
                    {index + 1}. {line}
                  </li>
                ))}
              </motion.ol>
            ) : (
              <motion.p
                key="output-empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="text-sm text-muted"
              >
                No console output yet.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export const EventLoopSimpleDemo = () => (
  <EventLoopSimulator {...simpleScenario} />
);

export const EventLoopComplexDemo = () => (
  <EventLoopSimulator {...complexScenario} />
);

export const EventLoopTimeoutDemo = () => (
  <EventLoopSimulator {...timeoutScenario} />
);
