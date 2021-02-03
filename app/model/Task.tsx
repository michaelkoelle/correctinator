/* eslint-disable import/no-cycle */
import ParentTask from './ParentTask';
import RateableTask from './RateableTask';
/*
export type SingleChoiceTask = RateableTask & {
  answer: Answer;
};

type Answer = {
  text: string;
  value: number;
}

export type MultipleChoiceTask = RateableTask & {
  answers: Answer[];
};

export type ChecklistItem = {
  text: string;
  value: number;
};

export type ChecklistTask = RateableTask & {
  checklist: ChecklistItem[];
};
*/

type Task = ParentTask | RateableTask;

export default Task;
