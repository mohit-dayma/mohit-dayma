import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

interface CalloutProps extends PropsWithChildren {
  type?: 'info' | 'warning' | 'success';
}

const colorByType = {
  info: 'border-line-subtle bg-surface text-muted',
  warning: 'border-line bg-surface text-foreground',
  success: 'border-line-subtle bg-surface text-muted',
};

export const Callout = ({ children, type = 'info' }: CalloutProps) => {
  return (
    <div
      className={twMerge(
        'my-6 rounded-lg border px-4 py-3 text-sm leading-relaxed md:text-base',
        colorByType[type],
      )}
    >
      {children}
    </div>
  );
};
