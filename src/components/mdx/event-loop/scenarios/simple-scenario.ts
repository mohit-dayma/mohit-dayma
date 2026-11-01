import type { EventLoopScenario } from '../types';

export const simpleScenario: EventLoopScenario = {
  title: 'Simple Example',
  subtitle: 'Synchronous logs vs Promise microtask vs setTimeout task',
  code: `console.log('A');\n\nsetTimeout(() => {\n  console.log('B - timeout');\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('C - promise');\n});\n\nconsole.log('D');`,
  expectedOrder: ['A', 'D', 'C - promise', 'B - timeout'],
  steps: [
    {
      title: 'Script starts on call stack',
      explanation: 'Global script enters the call stack.',
      stack: ['global()'],
      microtaskQueue: [],
      taskQueue: [],
      output: [],
    },
    {
      title: 'Synchronous log runs immediately',
      explanation: 'console.log("A") executes while still in the script.',
      stack: ['global()', 'console.log("A")'],
      microtaskQueue: [],
      taskQueue: [],
      output: ['A'],
    },
    {
      title: 'Timeout callback is scheduled as task',
      explanation:
        'setTimeout(..., 0) does not run now; callback goes to task queue.',
      stack: ['global()'],
      microtaskQueue: [],
      taskQueue: [{ id: 't1', label: 'timeout callback -> "B - timeout"' }],
      output: ['A'],
    },
    {
      title: 'Promise callback is scheduled as microtask',
      explanation: 'Promise.then callback enters microtask queue.',
      stack: ['global()'],
      microtaskQueue: [
        { id: 'm1', label: 'promise callback -> "C - promise"' },
      ],
      taskQueue: [{ id: 't1', label: 'timeout callback -> "B - timeout"' }],
      output: ['A'],
    },
    {
      title: 'Last synchronous log runs',
      explanation: 'console.log("D") is still part of script execution.',
      stack: ['global()', 'console.log("D")'],
      microtaskQueue: [
        { id: 'm1', label: 'promise callback -> "C - promise"' },
      ],
      taskQueue: [{ id: 't1', label: 'timeout callback -> "B - timeout"' }],
      output: ['A', 'D'],
    },
    {
      title: 'Script finishes, stack becomes empty',
      explanation: 'Event loop now checks queues because call stack is empty.',
      stack: [],
      microtaskQueue: [
        { id: 'm1', label: 'promise callback -> "C - promise"' },
      ],
      taskQueue: [{ id: 't1', label: 'timeout callback -> "B - timeout"' }],
      output: ['A', 'D'],
    },
    {
      title: 'Microtask queue drains first',
      explanation: 'Promise callback runs before task queue callbacks.',
      stack: ['promise callback'],
      microtaskQueue: [],
      taskQueue: [{ id: 't1', label: 'timeout callback -> "B - timeout"' }],
      output: ['A', 'D', 'C - promise'],
    },
    {
      title: 'Next task runs',
      explanation: 'Timeout callback finally executes.',
      stack: ['timeout callback'],
      microtaskQueue: [],
      taskQueue: [],
      output: ['A', 'D', 'C - promise', 'B - timeout'],
    },
  ],
};
