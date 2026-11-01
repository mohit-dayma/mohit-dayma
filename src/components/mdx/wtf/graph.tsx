'use client';

import { useId } from 'react';
import type { GraphEdge, GraphNode, GraphPositions } from './types';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: GraphPositions;
  activeNode?: string | null;
  highlighted?: string[];
  updated?: string[];
  focusFrom?: string | null;
  labels?: Record<string, string>;
  onSelectNode?: (id: string) => void;
  className?: string;
}

const RADIUS = 17;
const ACTIVE_COLOR = '#f59e0b';
const AUTHORITY_COLOR = '#3b82f6';

export const GraphCanvas = ({
  nodes,
  edges,
  positions,
  activeNode = null,
  highlighted = [],
  updated = [],
  focusFrom = null,
  labels,
  onSelectNode,
  className,
}: GraphCanvasProps) => {
  const markerId = `wtf-arrow-${useId().replace(/[:]/g, '')}`;

  const focused = focusFrom ?? activeNode;
  const focusedEdges = focused
    ? edges.filter((edge) => edge.from === focused)
    : [];

  return (
    <svg
      viewBox="0 0 640 300"
      className={className}
      role="img"
      aria-label="Social graph with follows as directed arrows"
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {edges.map((edge) => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        if (!from || !to) {
          return null;
        }

        const isFocused = focusedEdges.some(
          (focusedEdge) =>
            focusedEdge.from === edge.from && focusedEdge.to === edge.to,
        );
        const color = isFocused
          ? 'var(--color-foreground)'
          : 'var(--color-line)';
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const startX = from.x + Math.cos(angle) * RADIUS;
        const startY = from.y + Math.sin(angle) * RADIUS;
        const endX = to.x - Math.cos(angle) * (RADIUS + 4);
        const endY = to.y - Math.sin(angle) * (RADIUS + 4);

        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeOpacity={isFocused ? 1 : 0.45}
            strokeWidth={isFocused ? 2 : 1.2}
            markerEnd={`url(#${markerId})`}
            style={{ color }}
          />
        );
      })}

      {nodes.map((node) => {
        const pos = positions[node.id];
        if (!pos) {
          return null;
        }

        const isActive = node.id === activeNode;
        const isHighlighted = highlighted.includes(node.id);
        const isUpdated = updated.includes(node.id);
        const isFocusSource = node.id === focusFrom;
        const isYou = node.kind === 'you';
        const isAuthority = node.kind === 'authority';

        const fill = isActive
          ? ACTIVE_COLOR
          : isYou
            ? 'var(--color-foreground)'
            : 'var(--color-surface)';
        const stroke = isActive
          ? ACTIVE_COLOR
          : isYou
            ? 'var(--color-foreground)'
            : isAuthority
              ? AUTHORITY_COLOR
              : 'var(--color-line)';

        return (
          <g
            key={node.id}
            onClick={() => onSelectNode?.(node.id)}
            className={onSelectNode ? 'cursor-pointer' : undefined}
          >
            {(isHighlighted || isUpdated) && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={RADIUS + 5}
                fill="none"
                stroke={isUpdated ? ACTIVE_COLOR : 'var(--color-foreground)'}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.9}
              />
            )}
            {isFocusSource && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={RADIUS + 9}
                fill="none"
                stroke="var(--color-foreground)"
                strokeWidth={1}
                opacity={0.4}
              />
            )}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={RADIUS}
              fill={fill}
              stroke={stroke}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <text
              x={pos.x}
              y={pos.y + RADIUS + 7}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill={isActive ? ACTIVE_COLOR : 'var(--color-muted)'}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              {node.label}
            </text>
            {labels?.[node.id] && (
              <text
                x={pos.x}
                y={pos.y + RADIUS + 21}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-muted)"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                {labels[node.id]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
