/* eslint-disable @typescript-eslint/no-use-before-define */
import ConditionalComment from '../model/ConditionalComment';
import Correction from '../model/Correction';
import Rating from '../model/Rating';
import Task from '../model/Task';

export function wordWrap(text: string, max: number, depth = 0) {
  const lines = text.split('\n');

  const wrapedLines = lines.map((line) => {
    let lineWordMatrix: string[][] = [[]];
    const words = line.trim().split(' ');

    for (let i = 0; i < words.length; i += 1) {
      const word = words[i];

      if (
        lineWordMatrix[lineWordMatrix.length - 1]
          .map((w) => w.length)
          .reduce((acc, l) => acc + l, 0) +
          word.length >
        max
      ) {
        lineWordMatrix = lineWordMatrix.concat([[]]);
      }

      lineWordMatrix[lineWordMatrix.length - 1] = lineWordMatrix[
        lineWordMatrix.length - 1
      ].concat(word);
    }

    return lineWordMatrix
      .map((lw) => lw.join(' '))
      .join(`\n${'\t'.repeat(depth)}`);
  });

  return '\t'.repeat(depth) + wrapedLines.join(`\n${'\t'.repeat(depth)}`);
}

export function getRatingForTask(task: Task, ratings: Rating[]): Rating {
  const rating: Rating | undefined = ratings.find((r) => r.task.id === task.id);
  if (rating) {
    return rating;
  }
  throw new Error(`Cannot find rating for task ${task.id}`);
}

export function getRatingValueForTasks(
  tasks: Task[],
  ratings: Rating[]
): number {
  return tasks
    .map((t) =>
      t.tasks?.length
        ? getRatingValueForTasks(t.tasks, ratings)
        : getRatingForTask(t, ratings).value
    )
    .reduce((acc, v) => acc + v);
}

export function getMaxValueForTasks(tasks: Task[]): number {
  return tasks
    .map((task) => {
      if (task.tasks?.length) {
        return getMaxValueForTasks(task.tasks);
      }
      return task.max ? task.max : 0;
    })
    .reduce((acc, v) => acc + v);
}

export function serializeTasks(
  tasks: Task[],
  ratings: Rating[],
  type: string,
  depth = 0,
  delimiter = ':',
  maxChars = 60
) {
  return tasks
    .map((task) => {
      const subTasks: Task[] = task.tasks !== undefined ? task.tasks : [];
      const isParentTask = subTasks.length > 0;
      const rating = isParentTask ? undefined : getRatingForTask(task, ratings);
      const indent = '\t'.repeat(depth);
      const taskName = task.name;
      const value = isParentTask
        ? getRatingValueForTasks(subTasks, ratings)
        : rating?.value;
      const max = isParentTask ? getMaxValueForTasks(subTasks) : task.max;
      const commentOrSubtask =
        !isParentTask && rating && rating?.comment.text.trim().length > 0
          ? `${wordWrap(rating.comment.text, 60, depth + 1)}\n`
          : serializeTasks(
              subTasks,
              ratings,
              type,
              depth + 1,
              delimiter,
              maxChars
            );
      return `${indent}${taskName}${delimiter} ${value}/${max} ${type}\n${commentOrSubtask}`;
    })
    .join('');
}

export function getConditionalCommentForValue(
  percent: number,
  conditionalComments: ConditionalComment[]
) {
  const conditionalComment: ConditionalComment | undefined = conditionalComments
    .filter((comment) => comment.minPercentage <= percent)
    .sort((a, b) => b.minPercentage - a.minPercentage)
    .shift();

  return conditionalComment || { text: '', minPercentage: 0 };
}

export function serializeCorrection(
  correction: Correction,
  conditionalComments: ConditionalComment[] = []
): string {
  const ratings: Rating[] = correction.ratings ? correction.ratings : [];
  const tasks: Task[] = correction.submission.sheet.tasks
    ? correction.submission.sheet.tasks
    : [];
  const serializedTasks =
    tasks && ratings
      ? serializeTasks(tasks, ratings, correction.submission.sheet.valueType)
      : '';
  const serializedAnnotation =
    correction.annotation && correction.annotation.text.trim().length > 0
      ? `\n${wordWrap(correction.annotation.text, 60)}\n`
      : '';
  const conditionalComment = getConditionalCommentForValue(
    getRatingValueForTasks(tasks, ratings) /
      correction.submission.sheet.maxValue,
    conditionalComments
  ).text;
  const serializedConditionalComment =
    conditionalComment.length > 0 ? `\n${conditionalComment}\n` : '';

  return serializedTasks + serializedAnnotation + serializedConditionalComment;
}
