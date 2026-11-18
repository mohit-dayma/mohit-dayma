import type { PropsWithChildren } from 'react';

interface DeepDiveProps extends PropsWithChildren {
  title: string;
}

/** Collapsible detail for readers who want more than the main narrative. */
export const DeepDive = ({ title, children }: DeepDiveProps) => (
  <details className="group my-6 rounded-lg border border-line-subtle bg-surface">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium md:text-base [&::-webkit-details-marker]:hidden">
      <span>
        <span className="mr-2 text-xs font-normal text-faint">Deep dive</span>
        {title}
      </span>
      <span
        aria-hidden
        className="text-faint transition-transform group-open:rotate-45"
      >
        +
      </span>
    </summary>
    <div className="space-y-4 border-t border-line-subtle px-4 py-4">
      {children}
    </div>
  </details>
);
