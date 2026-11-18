'use client';

interface StepControlsProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isAutoplay: boolean;
  reset: () => void;
  previous: () => void;
  next: () => void;
  toggle: () => void;
}

export const StepControls = ({
  canGoBack,
  canGoNext,
  isAutoplay,
  reset,
  previous,
  next,
  toggle,
}: StepControlsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={reset}
        disabled={!canGoBack}
        className="rounded-md border border-line px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={previous}
        disabled={!canGoBack}
        className="rounded-md border border-line px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={next}
        disabled={!canGoNext}
        className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:cursor-not-allowed disabled:opacity-45"
      >
        Next Step
      </button>
      <button
        type="button"
        onClick={toggle}
        className="rounded-md border border-line px-3 py-1.5 text-xs font-medium"
      >
        {isAutoplay ? 'Pause' : 'Autoplay'}
      </button>
    </div>
  );
};
