/* eslint-disable import/no-cycle */
import ParentTask from './ParentTask';
import RateableTask from './RateableTask';
import SingleChoiceTask from './SingleChoiceTask';
/*
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

type Task = ParentTask | RateableTask | SingleChoiceTask;

export default Task;
