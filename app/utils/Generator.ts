import { v4 as uuidv4 } from 'uuid';
import CommentEntity from '../model/CommentEntity';
import RateableTask from '../model/RateableTask';
import RatingEntity from '../model/RatingEntity';
import SingleChoiceTask from '../model/SingleChoiceTask';
import TaskEntity from '../model/TaskEntity';
import TaskType from '../model/TaskType';

export const generateTask = (
  type: TaskType,
  name = 'Task Name'
): RateableTask | SingleChoiceTask => {
  switch (type) {
    case TaskType.SingleChoice:
      return {
        id: uuidv4(),
        name,
        answer: {
          text: 'text',
          value: 0,
        },
        delimiter: ')',
      };
    default:
      return {
        id: uuidv4(),
        name,
        max: 0,
        step: 0.5,
        delimiter: ':',
      };
  }
};

export const generateComment = (task: TaskEntity): CommentEntity => {
  return {
    id: uuidv4(),
    task: task.id,
    text: '',
  };
};

export const generateRating = (
  task: TaskEntity,
  comment: CommentEntity
): RatingEntity => {
  return {
    id: uuidv4(),
    task: task.id,
    value: 0,
    comment: comment.id,
  };
};
