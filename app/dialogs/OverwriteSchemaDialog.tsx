import { initializeSheet } from '../slices/SchemaSlice';
import { save } from '../utils/FileAccess';
import { getTopLevelTasks } from '../utils/TaskUtil';
import ConfirmationDialog from './ConfirmationDialog';
import StartCorrectionDialog from './StartCorrectionDialog';

export function onInitializeSheet(
  dispatch,
  showModal,
  autosave,
  selectedSheet,
  tasks,
  tasksEntity,
  ratingsEntity,
  commentsEntity
) {
  dispatch(
    initializeSheet(
      selectedSheet.id,
      tasksEntity,
      ratingsEntity,
      commentsEntity,
      getTopLevelTasks(tasks).map((t) => t.id)
    )
  );

  if (autosave) {
    dispatch(save());
  }

  showModal(
    ConfirmationDialog,
    StartCorrectionDialog(showModal, selectedSheet, tasks)
  );
}

const OverwriteSchemaDialog = (
  showModal,
  autosave,
  selectedSheet,
  tasks,
  tasksEntity,
  ratingsEntity,
  commentsEntity
) => {
  return {
    title: 'Overwrite schema?',
    text: `Are you sure you want to overwrite the existing schema of sheet "${selectedSheet?.name}"?
    All correction progress will be lost!`,
    onConfirm: (dispatch) => {
      onInitializeSheet(
        dispatch,
        showModal,
        autosave,
        selectedSheet,
        tasks,
        tasksEntity,
        ratingsEntity,
        commentsEntity
      );
    },
  };
};

export default OverwriteSchemaDialog;
