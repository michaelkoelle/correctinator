import Comment from './Comment';
import RateableTask from './RateableTask';
import SingleChoiceTask from './SingleChoiceTask';

type BaseRating = {
  id: string;
  comment: Comment;
  task: RateableTask | SingleChoiceTask;
};

export type ValueRating = BaseRating & {
  value: number;
  autoCorrected?: boolean;
};

export type MultipleValueRating = BaseRating & {
  values: number[];
};

type Rating = ValueRating; // | MultipleValueRating;

export default Rating;
