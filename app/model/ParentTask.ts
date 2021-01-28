/* eslint-disable import/no-cycle */
import BaseTask from './BaseTask';
import Task from './Task';

type ParentTask = BaseTask & {
  tasks: Task[];
};

export default ParentTask;
