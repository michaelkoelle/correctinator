import ParentTaskEntity from './ParentTaskEntity';
import RateableTask from './RateableTask';

type TaskEntity = RateableTask | ParentTaskEntity;

export default TaskEntity;
