import Correction from '../model/Correction';
import { overviewClearSelectedSheetWithId } from '../model/OverviewSlice';
import { schemaClearSelectedSheetWithId } from '../model/SchemaSlice';
import Sheet from '../model/Sheet';
import {
  deleteCorrectionFromWorkspace,
  reloadState,
  save,
} from '../utils/FileAccess';

const ConfirmDeleteSheetDialog = (
  autosave: boolean,
  sheet: Sheet,
  workspace: string,
  corrections: Correction[]
) => {
  return {
    title: 'Confirm Delete Sheet',
    text: `Are you sure you want to delete the sheet "${sheet.name}"?`,
    onConfirm: (dispatch) => {
      dispatch(schemaClearSelectedSheetWithId(sheet.id));
      dispatch(overviewClearSelectedSheetWithId(sheet.id));
      corrections.forEach((c) => deleteCorrectionFromWorkspace(c, workspace));
      dispatch(reloadState());
      if (autosave) {
        dispatch(save());
      }
    },
  };
};

export default ConfirmDeleteSheetDialog;
