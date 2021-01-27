import BaseTask from './BaseTask';

type RateableTask = BaseTask & {
  step: number;
  max: number;
};

export default RateableTask;
