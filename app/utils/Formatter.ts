/* eslint-disable @typescript-eslint/no-use-before-define */
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

export function getRatingValueForTask(
  tasks: Task[],
  ratings: Rating[]
): number {
  return tasks
    .map((t) =>
      t.tasks?.length
        ? getRatingValueForTask(t.tasks, ratings)
        : getRatingForTask(t, ratings).value
    )
    .reduce((acc, v) => acc + v);
}

export function getMaxValueForTask(tasks: Task[]): number {
  return tasks
    .map((task) => {
      if (task.tasks?.length) {
        return getMaxValueForTask(task.tasks);
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
  delimiter = ':'
) {
  return tasks
    .map((t) => {
      if (t.tasks && t?.tasks?.length > 0) {
        return `${'\t'.repeat(depth)}${
          t.name
        }${delimiter} ${getRatingValueForTask(
          t.tasks,
          ratings
        )}/${getMaxValueForTask(t.tasks)} ${type}\n${serializeTasks(
          t.tasks,
          ratings,
          type,
          depth + 1
        )}`;
      }
      const rating: Rating = getRatingForTask(t, ratings);
      return `${'\t'.repeat(depth)}${t.name}${delimiter} ${rating.value}/${
        t.max
      } ${type}\n${
        rating.comment.text.trim().length > 0
          ? `${wordWrap(rating.comment.text, 60, depth + 1)}\n`
          : ''
      }`;
    })
    .reduce((acc, s) => `${acc} ${s}`);
}

export function getConditionalComment(percent: number, commentValues: any[]) {
  const suitableComments: any[] = [];

  commentValues.forEach((commentValue: any) => {
    if (percent * 100 >= commentValue?.value) {
      suitableComments.push(commentValue);
    }
  });

  let max = { text: '', value: 0 };

  suitableComments.forEach((c) => {
    if (max.value <= c.value) {
      max = c;
    }
  });

  if (max?.text?.trim().length > 0) {
    return `\n${max.text}\n`;
  }
  return '';
}

export function correctionToString(
  correction: Correction,
  condComments: any[] = []
): string {
  let out = '';

  if (correction.submission.sheet.tasks && correction.ratings) {
    out += serializeTasks(
      correction.submission.sheet.tasks,
      correction.ratings,
      correction.submission.sheet.type
    );
  }

  if (correction.annotation && correction.annotation.text.trim().length > 0) {
    out += `\n${wordWrap(correction.annotation.text, 60, 0)}\n`;
  }

  if (
    correction.submission.sheet.tasks &&
    correction.ratings &&
    condComments !== undefined &&
    condComments?.length > 0
  ) {
    out += getConditionalComment(
      getRatingValueForTask(
        correction.submission.sheet.tasks,
        correction.ratings
      ) / correction.submission.sheet.maxValue,
      condComments
    );
  }

  return out;
}
