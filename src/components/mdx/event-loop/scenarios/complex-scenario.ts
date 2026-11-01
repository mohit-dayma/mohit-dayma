import type { EventLoopScenario } from '../types';

export const complexScenario: EventLoopScenario = {
  title: 'Complex Example',
  subtitle: 'Nested microtasks and tasks with ordering across turns',
  code: `console.log('1');\n\nsetTimeout(() => {\n  console.log('2 - timeout 1');\n\n  Promise.resolve().then(() => {\n    console.log('3 - microtask inside timeout');\n  });\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('4 - microtask 1');\n\n  setTimeout(() => {\n    console.log('5 - timeout inside microtask');\n  }, 0);\n});\n\nconsole.log('6');`,
  expectedOrder: [
    '1',
    '6',
    '4 - microtask 1',
    '2 - timeout 1',
    '3 - microtask inside timeout',
    '5 - timeout inside microtask',
  ],
  steps: [
    {
      title: 'Script enters stack',
      explanation: 'Global script begins.',
      stack: ['global()'],
      microtaskQueue: [],
      taskQueue: [],
      output: [],
    },
    {
      title: 'First sync log',
      explanation: 'console.log("1") runs immediately.',
      stack: ['global()', 'console.log("1")'],
      microtaskQueue: [],
      taskQueue: [],
      output: ['1'],
    },
    {
      title: 'First timeout is queued as task',
      explanation: 'Callback for "2 - timeout 1" waits in task queue.',
      stack: ['global()'],
      microtaskQueue: [],
      taskQueue: [{ id: 't1', label: 'timeout 1 -> "2 - timeout 1"' }],
      output: ['1'],
    },
    {
      title: 'Promise microtask is queued',
      explanation: 'Callback for "4 - microtask 1" goes to microtask queue.',
      stack: ['global()'],
      microtaskQueue: [{ id: 'm1', label: 'microtask 1 -> "4 - microtask 1"' }],
      taskQueue: [{ id: 't1', label: 'timeout 1 -> "2 - timeout 1"' }],
      output: ['1'],
    },
    {
      title: 'Second sync log',
      explanation: 'console.log("6") runs before async callbacks.',
      stack: ['global()', 'console.log("6")'],
      microtaskQueue: [{ id: 'm1', label: 'microtask 1 -> "4 - microtask 1"' }],
      taskQueue: [{ id: 't1', label: 'timeout 1 -> "2 - timeout 1"' }],
      output: ['1', '6'],
    },
    {
      title: 'Script ends, microtasks run first',
      explanation: 'Event loop drains microtask queue.',
      stack: ['microtask 1'],
      microtaskQueue: [],
      taskQueue: [{ id: 't1', label: 'timeout 1 -> "2 - timeout 1"' }],
      output: ['1', '6', '4 - microtask 1'],
    },
    {
      title: 'Microtask schedules another timeout',
      explanation:
        'setTimeout inside microtask queues "5 - timeout inside microtask" behind existing tasks.',
      stack: [],
      microtaskQueue: [],
      taskQueue: [
        { id: 't1', label: 'timeout 1 -> "2 - timeout 1"' },
        { id: 't2', label: 'timeout 2 -> "5 - timeout inside microtask"' },
      ],
      output: ['1', '6', '4 - microtask 1'],
    },
    {
      title: 'First task executes',
      explanation: 'timeout 1 callback logs "2 - timeout 1".',
      stack: ['timeout 1 callback'],
      microtaskQueue: [
        {
          id: 'm2',
          label: 'microtask from timeout 1 -> "3 - microtask inside timeout"',
        },
      ],
      taskQueue: [
        { id: 't2', label: 'timeout 2 -> "5 - timeout inside microtask"' },
      ],
      output: ['1', '6', '4 - microtask 1', '2 - timeout 1'],
    },
    {
      title: 'Microtask created inside timeout runs before next task',
      explanation:
        'Promise.then inside timeout 1 becomes a microtask and executes immediately before timeout 2.',
      stack: ['microtask from timeout 1'],
      microtaskQueue: [],
      taskQueue: [
        { id: 't2', label: 'timeout 2 -> "5 - timeout inside microtask"' },
      ],
      output: [
        '1',
        '6',
        '4 - microtask 1',
        '2 - timeout 1',
        '3 - microtask inside timeout',
      ],
    },
    {
      title: 'Second task executes',
      explanation: 'Now timeout 2 logs "5 - timeout inside microtask".',
      stack: ['timeout 2 callback'],
      microtaskQueue: [],
      taskQueue: [],
      output: [
        '1',
        '6',
        '4 - microtask 1',
        '2 - timeout 1',
        '3 - microtask inside timeout',
        '5 - timeout inside microtask',
      ],
    },
  ],
};
