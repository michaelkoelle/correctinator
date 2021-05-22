/* eslint-disable import/no-cycle */
import Task from '../model/Task';
import ConditionalComment from '../model/ConditionalComment';
import Correction from '../model/Correction';
import Rating from '../model/Rating';
import { isParentTask, isRateableTask, isSingleChoiceTask } from './TaskUtil';
import Term from '../model/Term';

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
  if (ratings.length > 0 && tasks.length > 0) {
    return tasks
      .map((t) =>
        isParentTask(t)
          ? getRatingValueForTasks(t.tasks, ratings)
          : getRatingForTask(t, ratings).value
      )
      .reduce((acc, v) => acc + v, 0);
  }
  return 0;
}

export function getMaxValueForTasks(tasks: Task[]): number {
  return tasks
    .map((task) => {
      if (isParentTask(task)) {
        return getMaxValueForTasks(task.tasks);
      }
      if (isRateableTask(task)) {
        return task.max;
      }
      if (isSingleChoiceTask(task)) {
        return task.answer.value;
      }
      return 0;
    })
    .reduce((acc, v) => acc + v, 0);
}

export function getTotalValueOfRatings(ratings: Rating[]) {
  return ratings.map((r) => r.value).reduce((acc, v) => acc + v, 0);
}

export function serializeTasks(
  tasks: Task[],
  ratings: Rating[],
  type: string,
  depth = 0,
  maxChars = 60
) {
  const getComment = (task: Task, rating: Rating) => {
    if (isRateableTask(task) && rating?.comment.text.trim().length > 0) {
      return `${wordWrap(rating.comment.text, 60, depth + 1)}\n`;
    }
    // Unused right now
    if (isSingleChoiceTask(task) && rating.value === 0) {
      const solution = `${task.name} -> ${task.answer.text}`;
      return `${wordWrap(solution, 60, depth + 1)}\n`;
    }
    return '';
  };
  return tasks
    .map((task) => {
      const delimiter = task.delimiter ? task.delimiter : ':';
      const subTasks: Task[] = isParentTask(task) ? task.tasks : [];
      const rating = isParentTask(task)
        ? undefined
        : getRatingForTask(task, ratings);
      const indent = '\t'.repeat(depth);
      const taskName = task.name;
      const value = isParentTask(task)
        ? getRatingValueForTasks(subTasks, ratings)
        : rating?.value;
      const max = getMaxValueForTasks([task]);
      const commentOrSubtask =
        !isParentTask(task) && rating
          ? getComment(task, rating)
          : serializeTasks(subTasks, ratings, type, depth + 1, maxChars);
      if (isSingleChoiceTask(task)) {
        return `${indent}${taskName}${delimiter} ${
          value !== undefined && value > 0 ? '✔️' : `❌ (${task.answer.text})`
        }\n`;
      }
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
  valueTypeOverwrite: string | undefined,
  conditionalComments: ConditionalComment[] = []
): string {
  const ratings: Rating[] = correction.ratings ? correction.ratings : [];
  const tasks: Task[] = correction.submission.sheet.tasks
    ? correction.submission.sheet.tasks
    : [];
  const serializedTasks =
    tasks && ratings
      ? serializeTasks(
          tasks,
          ratings,
          valueTypeOverwrite !== undefined
            ? valueTypeOverwrite
            : correction.submission.sheet.valueType
        )
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

export function serializeTerm(term: Term) {
  return term.summerterm ? `SS ${term.year}` : `WS ${term.year}`;
}
