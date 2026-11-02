'use client';

import { useState } from 'react';
import { mainPositions, wtfEdges, wtfNodes } from './data';
import { GraphCanvas } from './graph';

const nodeLabel = (id: string) =>
  wtfNodes.find((node) => node.id === id)?.label ?? `@${id}`;

export const GraphExplorer = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const followees = selected
    ? wtfEdges.filter((edge) => edge.from === selected).map((edge) => edge.to)
    : [];
  const selectedLabel = selected ? nodeLabel(selected) : null;

  return (
    <section className="my-8 overflow-hidden rounded-lg border border-line-subtle">
      <div className="border-b border-line-subtle p-4 md:p-5">
        <p className="text-xs font-medium text-muted">
          Interactive graph model
        </p>
        <h4 className="mt-1 text-lg font-medium tracking-tight md:text-xl">
          The interest graph
        </h4>
        <p className="mt-1 text-sm text-muted">
          You follow a few people; everyone follows someone.
        </p>
      </div>

      <div className="p-4 md:p-5">
        <GraphCanvas
          nodes={wtfNodes}
          edges={wtfEdges}
          positions={mainPositions}
          focusFrom={selected}
          onSelectNode={setSelected}
          className="h-auto w-full"
        />
      </div>

      <div className="border-t border-line-subtle p-4 text-sm leading-relaxed text-muted md:p-5">
        {selected && selectedLabel ? (
          <p>
            <span className="font-medium text-foreground">{selectedLabel}</span>{' '}
            {followees.length > 0
              ? `follows ${followees.map(nodeLabel).join(', ')}.`
              : 'follows nobody in this toy graph.'}{' '}
            Try another node.
          </p>
        ) : (
          <p>
            Click any account to see who they follow. The arrow points in the
            direction of the follow.
          </p>
        )}
      </div>
    </section>
  );
};
