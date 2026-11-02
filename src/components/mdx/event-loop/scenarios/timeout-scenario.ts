import type { EventLoopScenario } from '../types';

export const timeoutScenario: EventLoopScenario = {
  title: 'Timeout Not Zero Example',
  subtitle: 'Why setTimeout with 1000ms is a minimum delay, not exact timing',
  code: `const start = Date.now();\n\nsetTimeout(() => {\n  console.log('T1 ~1000ms', Date.now() - start);\n}, 1000);\n\nsetTimeout(() => {\n  console.log('T2 ~0ms', Date.now() - start);\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('Microtask', Date.now() - start);\n});\n\nconsole.log('Sync end', Date.now() - start);`,
  expectedOrder: ['Sync end', 'Microtask', 'T2 ~0ms', 'T1 ~1000ms (or later)'],
  steps: [
    {
      title: 'Script starts',
      explanation: 'Global script enters stack and sets reference start time.',
      stack: ['global()'],
      microtaskQueue: [],
      taskQueue: [],
      output: [],
    },
    {
      title: 'A 1000ms timeout is scheduled',
      explanation:
        'The browser starts a 1000ms timer. The callback enters the task queue only when the timer expires.',
      stack: ['global()'],
      microtaskQueue: [],
      taskQueue: [],
      output: [],
    },
    {
      title: 'A 0ms timeout is scheduled',
      explanation: '0ms means minimum delay, not immediate execution.',
      stack: ['global()'],
      microtaskQueue: [],
      taskQueue: [{ id: 't2', label: 'timeout(0) -> "T2 ~0ms"' }],
      output: [],
    },
    {
      title: 'Promise microtask is queued',
      explanation: 'Promise.then goes to microtask queue.',
      stack: ['global()'],
      microtaskQueue: [{ id: 'm1', label: 'promise callback -> "Microtask"' }],
      taskQueue: [{ id: 't2', label: 'timeout(0) -> "T2 ~0ms"' }],
      output: [],
    },
    {
      title: 'Sync log runs',
      explanation: 'console.log("Sync end") executes during script.',
      stack: ['global()', 'console.log("Sync end")'],
      microtaskQueue: [{ id: 'm1', label: 'promise callback -> "Microtask"' }],
      taskQueue: [{ id: 't2', label: 'timeout(0) -> "T2 ~0ms"' }],
      output: ['Sync end'],
    },
    {
      title: 'Microtask runs first',
      explanation: 'After stack clears, microtask runs before any timeout.',
      stack: ['promise callback'],
      microtaskQueue: [],
      taskQueue: [{ id: 't2', label: 'timeout(0) -> "T2 ~0ms"' }],
      output: ['Sync end', 'Microtask'],
    },
    {
      title: '0ms timeout executes next',
      explanation: 'Now task queue callback with 0ms delay runs.',
      stack: ['timeout(0) callback'],
      microtaskQueue: [],
      taskQueue: [],
      output: ['Sync end', 'Microtask', 'T2 ~0ms'],
    },
    {
      title: '1000ms timer expires',
      explanation:
        'After at least 1000ms, the timer puts its callback in the task queue.',
      stack: [],
      microtaskQueue: [],
      taskQueue: [{ id: 't1', label: 'timeout(1000) -> "T1 ~1000ms"' }],
      output: ['Sync end', 'Microtask', 'T2 ~0ms'],
    },
    {
      title: '1000ms timeout executes later',
      explanation:
        'Only after its timer threshold and an available stack turn does timeout(1000) run.',
      stack: ['timeout(1000) callback'],
      microtaskQueue: [],
      taskQueue: [],
      output: ['Sync end', 'Microtask', 'T2 ~0ms', 'T1 ~1000ms (or later)'],
    },
  ],
};
