export type NodeKind = 'you' | 'hub' | 'authority' | 'default';

export type GraphNode = {
  id: string;
  label: string;
  kind?: NodeKind;
};

export type GraphEdge = {
  from: string;
  to: string;
};

export type GraphPositions = Record<string, { x: number; y: number }>;

export type WalkStep = {
  title: string;
  explanation: string;
  currentNode: string;
  visitedCounts: Record<string, number>;
  circleOfTrust: string[];
};

export type SalsaStep = {
  title: string;
  explanation: string;
  hubScores: Record<string, number>;
  authorityScores: Record<string, number>;
  updated: string[];
};

export type QueueStep = {
  title: string;
  explanation: string;
  queue: string[];
  highlight?: string;
};

export type FacetQuestion = {
  example: string;
  answer: 'interested-in' | 'similar-to';
  reason: string;
};
