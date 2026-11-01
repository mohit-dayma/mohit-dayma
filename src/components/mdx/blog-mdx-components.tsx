import type { MDXComponents } from 'mdx/types';
import { Callout } from './callout';
import {
  EventLoopComplexDemo,
  EventLoopSimpleDemo,
  EventLoopTimeoutDemo,
} from './event-loop-simulator';
import { CircleOfTrust } from './wtf/circle-of-trust';
import { ColdStartQueue } from './wtf/cold-start-queue';
import { FacetGame } from './wtf/facet-game';
import { GraphExplorer } from './wtf/graph-explorer';
import { MemoryDecision } from './wtf/memory-decision';
import { SalsaDemo } from './wtf/salsa-demo';

export const blogMdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="pt-6 text-2xl font-semibold tracking-tight text-white md:text-3xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="pt-2 text-xl font-semibold text-white" {...props} />
  ),
  p: (props) => (
    <p className="text-base leading-relaxed text-muted md:text-lg" {...props} />
  ),
  ul: (props) => <ul className="list-disc space-y-2 pl-6" {...props} />,
  li: (props) => <li className="text-muted" {...props} />,
  a: (props) => <a className="link" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-2 border-line pl-4 italic text-muted"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-line-subtle bg-surface p-4 text-sm md:text-base"
      {...props}
    />
  ),
  code: ({ className, ...props }) => {
    const isBlockCode = Boolean(className?.includes('language-'));

    if (isBlockCode) {
      return <code className={className} {...props} />;
    }

    return (
      <code
        className="rounded-md border border-line-subtle bg-surface px-1.5 py-0.5 font-mono text-[0.88em] text-foreground"
        {...props}
      />
    );
  },
  Callout,
  EventLoopSimpleDemo,
  EventLoopComplexDemo,
  EventLoopTimeoutDemo,
  CircleOfTrust,
  ColdStartQueue,
  FacetGame,
  GraphExplorer,
  MemoryDecision,
  SalsaDemo,
};
