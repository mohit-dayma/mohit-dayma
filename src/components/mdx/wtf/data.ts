import type {
  FacetQuestion,
  GraphEdge,
  GraphNode,
  GraphPositions,
  QueueStep,
  SalsaStep,
  WalkStep,
} from './types';

export const wtfNodes: GraphNode[] = [
  { id: 'you', label: '@you', kind: 'you' },
  { id: 'alice', label: '@alice', kind: 'hub' },
  { id: 'bob', label: '@bob', kind: 'hub' },
  { id: 'carol', label: '@carol', kind: 'hub' },
  { id: 'dan', label: '@dan', kind: 'authority' },
  { id: 'erin', label: '@erin', kind: 'authority' },
  { id: 'finn', label: '@finn', kind: 'authority' },
];

export const wtfEdges: GraphEdge[] = [
  { from: 'you', to: 'alice' },
  { from: 'you', to: 'bob' },
  { from: 'you', to: 'carol' },
  { from: 'alice', to: 'bob' },
  { from: 'alice', to: 'dan' },
  { from: 'alice', to: 'erin' },
  { from: 'bob', to: 'carol' },
  { from: 'bob', to: 'dan' },
  { from: 'carol', to: 'alice' },
  { from: 'carol', to: 'erin' },
  { from: 'carol', to: 'finn' },
  { from: 'dan', to: 'erin' },
  { from: 'erin', to: 'finn' },
  { from: 'finn', to: 'bob' },
];

export const mainPositions: GraphPositions = {
  you: { x: 320, y: 42 },
  alice: { x: 140, y: 132 },
  bob: { x: 320, y: 144 },
  carol: { x: 500, y: 132 },
  dan: { x: 150, y: 250 },
  erin: { x: 320, y: 262 },
  finn: { x: 490, y: 250 },
};

export const bipartitePositions: GraphPositions = {
  alice: { x: 160, y: 84 },
  bob: { x: 160, y: 150 },
  carol: { x: 160, y: 216 },
  dan: { x: 480, y: 70 },
  erin: { x: 480, y: 150 },
  finn: { x: 480, y: 230 },
};

export const bipartiteEdges: GraphEdge[] = [
  { from: 'alice', to: 'dan' },
  { from: 'alice', to: 'erin' },
  { from: 'bob', to: 'dan' },
  { from: 'carol', to: 'erin' },
  { from: 'carol', to: 'finn' },
];

export const walkSteps: WalkStep[] = [
  {
    title: 'Start at @you',
    explanation: 'Every walk begins at @you.',
    currentNode: 'you',
    visitedCounts: { you: 1 },
    circleOfTrust: [],
  },
  {
    title: 'Hop to @alice',
    explanation:
      'The walker randomly picks one of your followees. Here it lands on @alice.',
    currentNode: 'alice',
    visitedCounts: { you: 1, alice: 1 },
    circleOfTrust: ['alice'],
  },
  {
    title: 'Hop to @bob',
    explanation:
      '@alice also follows @bob. So the walk can stay inside your neighborhood.',
    currentNode: 'bob',
    visitedCounts: { you: 1, alice: 1, bob: 1 },
    circleOfTrust: ['alice', 'bob'],
  },
  {
    title: 'Hop to @carol',
    explanation:
      '@bob follows @carol. The walk stays among the accounts you already follow.',
    currentNode: 'carol',
    visitedCounts: { you: 1, alice: 1, bob: 1, carol: 1 },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Back to @alice',
    explanation:
      '@carol follows @alice. So the walk loops back. @alice now has two visits.',
    currentNode: 'alice',
    visitedCounts: { you: 1, alice: 2, bob: 1, carol: 1 },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Deeper: @dan',
    explanation:
      'Sometimes the walk leaves your immediate circle. @alice follows @dan, a sports account.',
    currentNode: 'dan',
    visitedCounts: { you: 1, alice: 2, bob: 1, carol: 1, dan: 1 },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Hop to @erin',
    explanation:
      '@dan follows @erin. The walker is now two hops away from you.',
    currentNode: 'erin',
    visitedCounts: { you: 1, alice: 2, bob: 1, carol: 1, dan: 1, erin: 1 },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Hop to @finn',
    explanation: '@erin follows @finn. Such far visits happen rarely.',
    currentNode: 'finn',
    visitedCounts: {
      you: 1,
      alice: 2,
      bob: 1,
      carol: 1,
      dan: 1,
      erin: 1,
      finn: 1,
    },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Return to @bob',
    explanation:
      '@finn follows @bob. This pulls the walk back into your neighborhood.',
    currentNode: 'bob',
    visitedCounts: {
      you: 1,
      alice: 2,
      bob: 2,
      carol: 1,
      dan: 1,
      erin: 1,
      finn: 1,
    },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Back to @carol',
    explanation:
      '@bob follows @carol again. The walk keeps coming back to the accounts you know.',
    currentNode: 'carol',
    visitedCounts: {
      you: 1,
      alice: 2,
      bob: 2,
      carol: 2,
      dan: 1,
      erin: 1,
      finn: 1,
    },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Again @alice',
    explanation:
      '@carol follows @alice. After many walks, @alice keeps showing up.',
    currentNode: 'alice',
    visitedCounts: {
      you: 1,
      alice: 3,
      bob: 2,
      carol: 2,
      dan: 1,
      erin: 1,
      finn: 1,
    },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Circle of trust found',
    explanation:
      'After many random walks, the most-visited accounts form your circle of trust: @alice, @bob, @carol — the accounts you follow.',
    currentNode: 'you',
    visitedCounts: {
      you: 1,
      alice: 3,
      bob: 2,
      carol: 2,
      dan: 1,
      erin: 1,
      finn: 1,
    },
    circleOfTrust: ['alice', 'bob', 'carol'],
  },
];

export const salsaSteps: SalsaStep[] = [
  {
    title: 'Build the bipartite graph',
    explanation:
      'The hubs are on the left. They are your circle of trust: @alice, @bob, @carol. The authorities are on the right. They are the accounts that the hubs follow: @dan, @erin, @finn. Every node starts with an equal score.',
    hubScores: { alice: 0.33, bob: 0.33, carol: 0.33 },
    authorityScores: { dan: 0.33, erin: 0.33, finn: 0.33 },
    updated: [],
  },
  {
    title: 'Authority pass',
    explanation:
      'Each authority receives a share of the score from the hubs that point to it. @alice gives half of her score to @dan. @bob gives all of his score to @dan. So @dan goes up.',
    hubScores: { alice: 0.33, bob: 0.33, carol: 0.33 },
    authorityScores: { dan: 0.5, erin: 0.33, finn: 0.17 },
    updated: ['dan', 'erin', 'finn'],
  },
  {
    title: 'Hub pass',
    explanation:
      'Now the hubs receive score from the authorities they reach. @alice points at the popular @dan. So @alice gains score.',
    hubScores: { alice: 0.42, bob: 0.25, carol: 0.33 },
    authorityScores: { dan: 0.5, erin: 0.33, finn: 0.17 },
    updated: ['alice', 'bob', 'carol'],
  },
  {
    title: 'Authority pass again',
    explanation:
      'Repeat the pass. @carol keeps giving score to @erin. So @erin climbs. Only @carol points to @finn. So @finn stays low.',
    hubScores: { alice: 0.42, bob: 0.25, carol: 0.33 },
    authorityScores: { dan: 0.46, erin: 0.38, finn: 0.17 },
    updated: ['dan', 'erin', 'finn'],
  },
  {
    title: 'The recommendations',
    explanation:
      'Rank the authorities by score. @dan is first, then @erin, then @finn. These are your "interested in" recommendations.',
    hubScores: { alice: 0.42, bob: 0.25, carol: 0.33 },
    authorityScores: { dan: 0.46, erin: 0.38, finn: 0.17 },
    updated: [],
  },
];

export const queueSteps: QueueStep[] = [
  {
    title: 'The refresh queue',
    explanation:
      'Existing users wait for a new scan and new recommendations. The queue serves the front first.',
    queue: ['alice', 'bob', 'carol', 'dan', 'erin', 'finn'],
  },
  {
    title: '@newbie signs up',
    explanation:
      'A brand-new user has zero history. This is the cold-start problem. That user goes to the front of the queue.',
    queue: ['newbie', 'alice', 'bob', 'carol', 'dan', 'erin', 'finn'],
    highlight: 'newbie',
  },
  {
    title: '@newbie served first',
    explanation:
      'New users get near-real-time recommendations. They see value immediately. They often see it before they finish account setup.',
    queue: ['alice', 'bob', 'carol', 'dan', 'erin', 'finn'],
  },
  {
    title: '@fresh signs up',
    explanation:
      'Another cold-start user arrives. That user goes ahead of everyone else.',
    queue: ['fresh', 'alice', 'bob', 'carol', 'dan', 'erin', 'finn'],
    highlight: 'fresh',
  },
  {
    title: 'Everyone else waits',
    explanation:
      'Existing users are refreshed on a slower batch cycle. New users are fast. Existing users are thorough.',
    queue: ['alice', 'bob', 'carol', 'dan', 'erin', 'finn'],
  },
];

export const facetQuestions: FacetQuestion[] = [
  {
    example:
      'A cricket fan does not follow @espn yet. Should the system suggest it?',
    answer: 'interested-in',
    reason:
      'The reader cares about the topic. They are not similar to @espn. This is an "interested in" recommendation.',
  },
  {
    example:
      'You and @priya follow the same 40 developers and 12 design accounts.',
    answer: 'similar-to',
    reason:
      'Similarity comes from overlap in who you follow. This is the "similar to" facet, also called homophily.',
  },
  {
    example: 'A basketball lover follows @NBA. The system suggests @WNBA.',
    answer: 'interested-in',
    reason:
      '"Interested in" captures the topic. @NBA and @WNBA are different accounts, not similar ones.',
  },
  {
    example:
      'Two photography accounts follow almost the same people, so they are shown as "similar to each other" on their profiles.',
    answer: 'similar-to',
    reason:
      'Profile similarity is the "similar to" facet. The paper exposes it as a product feature.',
  },
];
