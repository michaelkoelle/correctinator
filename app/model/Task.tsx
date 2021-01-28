/* eslint-disable import/no-cycle */
import ParentTask from './ParentTask';
import RateableTask from './RateableTask';
/*
export type SingleChoiceTask = RateableTask & {
  options: string[];
  answers: number[];
};

type Answer = {
  text: string;
  value: number;
}

export type MultipleChoiceTask = RateableTask & {
  options: string[];
  answer: number[];
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
