import Answer from './Answer';
import BaseTask from './BaseTask';

type SingleChoiceTask = BaseTask & {
  answer: Answer;
};

export default SingleChoiceTask;
