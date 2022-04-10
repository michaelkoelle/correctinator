/* eslint-disable no-empty */
import RateableTask from '../model/RateableTask';
import {
  schemaSetClipboard,
  schemaSetEntities,
  schemaSetSelectedSheet,
} from '../slices/SchemaSlice';
import SingleChoiceTask from '../model/SingleChoiceTask';
import TaskEntity from '../model/TaskEntity';
import { parseSchemaTasks } from '../utils/SchemaUtil';
import {
  isParentTaskEntity,
  isRateableTask,
  isSingleChoiceTask,
} from '../utils/TaskUtil';

const PasteFromClipboardDialog = (clipboard, sheets) => {
  function onPasteFromClipboard(dispatch) {
    const text = clipboard.readText();
    try {
      const newEntities = parseSchemaTasks(JSON.parse(text));
      if (newEntities.tasks && newEntities.ratings && newEntities.comments) {
        const max = Object.entries<TaskEntity>(newEntities.tasks)
          .map(([, v]) => {
            if (isParentTaskEntity(v)) {
              return 0;
            }
            if (isRateableTask(v)) {
              return (v as RateableTask).max;
            }
            if (isSingleChoiceTask(v)) {
              return (v as SingleChoiceTask).answer.value;
            }
            return 0;
          })
          .reduce((acc, v) => acc + v, 0);
        const suitableSheet = sheets.find(
          (s) => (!s.tasks || s.tasks.length === 0) && s.maxValue === max
        );
        if (suitableSheet) {
          dispatch(schemaSetSelectedSheet(suitableSheet.id));
        }
        dispatch(
          schemaSetEntities({
            tasks: newEntities.tasks.reduce((acc, v) => {
              acc[v.id] = v;
              return acc;
            }, {}),
            ratings: newEntities.ratings.reduce((acc, v) => {
              acc[v.id] = v;
              return acc;
            }, {}),
            comments: newEntities.comments.reduce((acc, v) => {
              acc[v.id] = v;
              return acc;
            }, {}),
          })
        );
        dispatch(schemaSetClipboard(text));
      }
    } catch (error) {}
  }

  function clearClipborad(dispatch) {
    const text = clipboard.readText();
    dispatch(schemaSetClipboard(text));
  }

  return {
    title: 'Paste from Clipboard?',
    text: `Do you want to paste the correction schema from you clipboard?`,
    onConfirm: (dispatch) => {
      onPasteFromClipboard(dispatch);
    },
    onReject: (dispatch) => {
      clearClipborad(dispatch);
    },
  };
};

export default PasteFromClipboardDialog;
