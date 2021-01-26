import Comment from './Comment';
import { Task } from './Task';

type BaseRating = { id: string; comment: Comment; task: Task };

export type ValueRating = BaseRating & {
  value: number;
};

export type MultipleValueRating = {
  values: number[];
};

export type Rating = ValueRating | MultipleValueRating;

export default Rating;
