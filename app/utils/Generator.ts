import { v4 as uuidv4 } from 'uuid';
import CommentEntity from '../model/CommentEntity';
import RateableTask from '../model/RateableTask';
import RatingEntity from '../model/RatingEntity';
import SingleChoiceTask from '../model/SingleChoiceTask';
import TaskEntity from '../model/TaskEntity';

export const generateSimpleTask = (name = 'Task Name'): RateableTask => {
  return {
    id: uuidv4(),
    name,
    max: 0,
    step: 0.5,
    delimiter: ':',
  };
};

export const generateSingleChoiceTask = (
  name = 'Task Name'
): SingleChoiceTask => {
  return {
    id: uuidv4(),
    name,
    answer: {
      text: 'text',
      value: 0,
    },
    delimiter: ')',
  };
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
