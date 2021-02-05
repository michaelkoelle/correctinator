import BaseTask from './BaseTask';

type ParentTaskEntity = BaseTask & {
  tasks: string[];
};

export default ParentTaskEntity;
