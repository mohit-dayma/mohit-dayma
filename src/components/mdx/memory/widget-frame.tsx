import type { PropsWithChildren, ReactNode } from 'react';

interface WidgetFrameProps extends PropsWithChildren {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
}

export const WidgetFrame = ({
  eyebrow,
  title,
  description,
  children,
}: WidgetFrameProps) => (
  <section className="my-8 overflow-hidden rounded-lg border border-line-subtle">
    <div className="border-b border-line-subtle p-4 md:p-5">
      <p className="text-xs font-medium text-muted">{eyebrow}</p>
      <h4 className="mt-1 text-lg font-medium tracking-tight md:text-xl">
        {title}
      </h4>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
    {children}
  </section>
);

interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export const Segmented = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) => (
  <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(option.value)}
          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
            selected
              ? 'border-foreground bg-foreground text-background'
              : 'border-line text-muted hover:text-foreground'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
