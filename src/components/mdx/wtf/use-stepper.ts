'use client';

import { useEffect, useState } from 'react';

export const useStepper = (length: number, intervalMs = 1100) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [autoplayRequested, setAutoplayRequested] = useState(false);

  const isLast = length === 0 || stepIndex === length - 1;
  const canGoBack = stepIndex > 0;
  const canGoNext = !isLast;
  // Autoplay stops by itself on the last step, so updaters stay pure.
  const isAutoplay = autoplayRequested && !isLast;

  useEffect(() => {
    if (!isAutoplay) {
      return;
    }

    const timer = window.setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, length - 1));
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isAutoplay, length, intervalMs]);

  const reset = () => {
    setAutoplayRequested(false);
    setStepIndex(0);
  };

  const previous = () => {
    setAutoplayRequested(false);
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const next = () => {
    setAutoplayRequested(false);
    setStepIndex((prev) => Math.min(length - 1, prev + 1));
  };

  const toggle = () => {
    if (length === 0) {
      return;
    }

    if (!isAutoplay && isLast) {
      setStepIndex(0);
      setAutoplayRequested(true);
      return;
    }

    setAutoplayRequested(!isAutoplay);
  };

  return {
    stepIndex,
    isAutoplay,
    isLast,
    canGoBack,
    canGoNext,
    reset,
    previous,
    next,
    toggle,
  };
};
