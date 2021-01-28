import Comment from './Comment';
import RateableTask from './RateableTask';

type BaseRating = { id: string; comment: Comment; task: RateableTask };

export type ValueRating = BaseRating & {
  value: number;
};

export type MultipleValueRating = BaseRating & {
  values: number[];
};

type Rating = ValueRating; // | MultipleValueRating;

export default Rating;
