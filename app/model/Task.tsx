type BaseTask = {
  id: string;
  name: string;
};

export type ParentTask = BaseTask & {
  tasks: Task[];
};

export type RateableTask = BaseTask & {
  step: number;
  max: number;
};

export type SingleChoiceTask = RateableTask & {
  options: string[];
  answer: number;
};

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

export type Task =
  | ParentTask
  | RateableTask
  | SingleChoiceTask
  | MultipleChoiceTask
  | ChecklistTask;
