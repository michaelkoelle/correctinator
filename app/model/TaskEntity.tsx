import ParentTaskEntity from './ParentTaskEntity';
import RateableTask from './RateableTask';
import SingleChoiceTask from './SingleChoiceTask';

type TaskEntity = RateableTask | ParentTaskEntity | SingleChoiceTask;

export default TaskEntity;
