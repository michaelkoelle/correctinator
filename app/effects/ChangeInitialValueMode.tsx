import InitializationMode, {
  getInitialValue,
} from '../model/InitializationMode';
import RatingEntity from '../model/RatingEntity';
import { schemaUpsertRating } from '../model/SchemaSlice';
import TaskEntity from '../model/TaskEntity';
import { isSingleChoiceTask, isRateableTask } from '../utils/TaskUtil';

const ChangeInitialValueMode = (
  dispatch,
  initMode,
  ratingsEntity,
  tasksEntity
) => {
  return () => {
    if (initMode === InitializationMode.MANUAL) {
      return;
    }
    ratingsEntity.forEach((r: RatingEntity) => {
      const rating = { ...r };
      const task = tasksEntity.find((t: TaskEntity) => t.id === r.task);
      if (task) {
        if (isSingleChoiceTask(task)) {
          rating.value = getInitialValue(initMode, r.value, task.answer.value);
        } else if (isRateableTask(task)) {
          rating.value = getInitialValue(initMode, r.value, task.max);
        }
      }

      if (rating.value !== r.value) {
        dispatch(schemaUpsertRating(rating));
      }
    });
  };
};

export default ChangeInitialValueMode;
