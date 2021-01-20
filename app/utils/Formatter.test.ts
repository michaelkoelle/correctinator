import Correction from '../model/Correction';
import Rating from '../model/Rating';
import Status from '../model/Status';
import Task from '../model/Task';
import {
  getMaxValueForTasks,
  getRatingForTask,
  getRatingValueForTasks,
  serializeTasks,
  wordWrap,
} from './Formatter';

const correctionTestData2: Correction = {
  id: 'd519b90c-6b6e-5d67-9e0d-318f05693b01',
  ratings: [
    {
      id: 'f928b81f-2bba-5635-8633-94fc0bc89b68',
      value: 2,
      comment: {
        // id: 'f35c6903-6ba8-4f82-8213-5f63afcd0dcb',
        text: '',
        task: {
          id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
          name: 'Task 1.1',
          max: 3,
          step: 1,
        },
      },
      task: {
        id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
        name: 'Task 1.1',
        max: 3,
        step: 1,
      },
    },
    {
      id: 'c0efdf57-9b65-564c-a12b-f6e2907e7cd9',
      value: 1.5,
      comment: {
        // id: '627ec545-83b2-493c-a10e-6a0dd2515b1e',
        text:
          'this is a test comment, a really long test comment, a really really long one, i wonder how long it really is, \nit still goes on, \nthat is insane this is the longest comment in the history of comments, maybe ever',
        task: {
          id: '3de4bec5-5608-44f7-8dad-08022b61a232',
          name: 'Task 1.2',
          max: 2,
          step: 0.5,
        },
      },
      task: {
        id: '3de4bec5-5608-44f7-8dad-08022b61a232',
        name: 'Task 1.2',
        max: 2,
        step: 0.5,
      },
    },
    {
      id: '50d53aa3-5e3b-5d2f-8239-9c51db727b10',
      value: 5,
      comment: {
        // id: '40f6a198-49bc-4505-9844-e4203928a4e6',
        text: '',
        task: {
          id: '3573ec3a-9ae9-4c52-bcb6-05c7e0ca14962',
          name: 'Task 2',
          max: 5,
          step: 1,
        },
      },
      task: {
        id: '3573ec3a-9ae9-4c52-bcb6-05c7e0ca14962',
        name: 'Task 2',
        max: 5,
        step: 1,
      },
    },
  ],
  submission: {
    id: 'd519b90c-6b6e-5d67-9e0d-318f05693b01',
    name: 'uwazxvya2akrnnc2',
    files: [
      'C:\\Users\\Michi\\AppData\\Roaming\\Electron\\submissions\\uwazxvya2akrnnc2\\files\\Hausarbeit 5 Rechnerarchitektur Abgabe.pdf',
    ],
    sheet: {
      id: 'e9a0d6f5-14ab-55b2-9973-c3be7f1f7c73',
      name: 'Online-Hausarbeit 5',
      type: 'normal',
      tasks: [
        {
          id: 'f48d7ba3-b6ad-443b-9ea2-e180889cdb3f',
          name: 'Task 1',
          tasks: [
            {
              id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
              name: 'Task 1.1',
              max: 3,
              step: 1,
            },
            {
              id: '3de4bec5-5608-44f7-8dad-08022b61a232',
              name: 'Task 1.2',
              max: 2,
              step: 0.5,
            },
          ],
        },
        {
          id: '3573ec3a-9ae9-4c52-bcb6-05c7e0ca14962',
          name: 'Task 2',
          max: 5,
          step: 1,
        },
      ],
      maxValue: 10,
      valueType: 'points',
      school: {
        id: '344bd582-e110-53f6-a10c-6a14d6a7e291',
        name: 'Institut für Informatik',
      },
      term: {
        id: 'b91bb5ff-1141-53f7-96b5-2cafc53ce6ea',
        year: 2020,
        summerterm: true,
      },
      course: {
        id: '73ae54b7-afdd-5912-a5d0-a1dd488fe912',
        name: 'Rechnerarchitektur',
      },
    },
  },
  corrector: {
    id: 'b3aa67d2-4ae3-5441-860a-88ab5391673d',
    name: 'John Doe',
  },
  status: Status.Todo,
  location: {
    id: '148bdfa9-7596-5319-a197-ead64880df40',
    name: null,
  },
  // note: { text: '' },
  // annotation: { text: '' },
};
correctionTestData2.submission.correction = correctionTestData2;

const tasks: Task[] = correctionTestData2.submission.sheet.tasks
  ? correctionTestData2.submission.sheet.tasks
  : [];

const ratings: Rating[] = correctionTestData2.ratings
  ? correctionTestData2.ratings
  : [];

test('wordWrap', () => {
  expect(
    wordWrap(
      `this is a text used for testing purposes\nand i am testing the word wrap function`,
      10
    )
  ).toBe(
    `this is a\ntext used\nfor testing\npurposes\nand i am\ntesting the\nword wrap\nfunction`
  );
});

test('wordWrap 2', () => {
  expect(
    wordWrap(
      `this is a test comment, a really long test comment, a really really long one, i wonder how long it really is, \nit still goes on, \nthat is insane this is the longest comment in the history of comments, maybe ever`,
      60,
      2
    )
  ).toBe(
    `\t\tthis is a test comment, a really long test comment, a really really long\n\t\tone, i wonder how long it really is,\n\t\tit still goes on,\n\t\tthat is insane this is the longest comment in the history of comments,\n\t\tmaybe ever`
  );
});

test('getRatingForTask Rating', () => {
  expect(
    getRatingForTask(
      {
        id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
        name: 'Task 1.1',
        max: 3,
        step: 1,
      },
      ratings
    )
  ).toStrictEqual({
    id: 'f928b81f-2bba-5635-8633-94fc0bc89b68',
    value: 2,
    comment: {
      // id: 'f35c6903-6ba8-4f82-8213-5f63afcd0dcb',
      text: '',
      task: {
        id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
        name: 'Task 1.1',
        max: 3,
        step: 1,
      },
    },
    task: {
      id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
      name: 'Task 1.1',
      max: 3,
      step: 1,
    },
  });
});

test('getRatingForTask Parent', () => {
  expect(() =>
    getRatingForTask(
      {
        id: 'f48d7ba3-b6ad-443b-9ea2-e180889cdb3f',
        name: 'Task 1',
        tasks: [
          {
            id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
            name: 'Task 1.1',
            max: 3,
            step: 1,
          },
          {
            id: '3de4bec5-5608-44f7-8dad-08022b61a232',
            name: 'Task 1.2',
            max: 2,
            step: 0.5,
          },
        ],
      },
      ratings
    )
  ).toThrow();
});

test('getRatingValueForTask', () => {
  expect(getRatingValueForTasks(tasks, ratings)).toBe(8.5);
});

test('getRatingValueForTask inner task', () => {
  expect(
    getRatingValueForTasks(
      [
        {
          id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
          name: 'Task 1.1',
          max: 3,
          step: 1,
        },
      ],
      ratings
    )
  ).toBe(2);
});

test('getMaxValueForTask', () => {
  expect(getMaxValueForTasks(tasks)).toBe(10);
});

test('getMaxValueForTask inner task', () => {
  expect(
    getMaxValueForTasks([
      {
        id: '45f61c3e-5a31-11eb-b0d6-cf4c183ddd7e',
        name: 'Task 1.1',
        max: 3,
        step: 1,
      },
    ])
  ).toBe(3);
});

test('serializeTasks', () => {
  expect(
    serializeTasks(
      tasks,
      ratings,
      correctionTestData2.submission.sheet.valueType
    )
  ).toBe(
    'Task 1: 3.5/5 points\n\tTask 1.1: 2/3 points\n\tTask 1.2: 1.5/2 points\n\t\tthis is a test comment, a really long test comment, a really really long\n\t\tone, i wonder how long it really is,\n\t\tit still goes on,\n\t\tthat is insane this is the longest comment in the history of comments,\n\t\tmaybe ever\nTask 2: 5/5 points\n'
  );
});
