import {
  overwriteConflictedCorrections,
  resetImportConflicts,
} from '../model/SheetOverviewSlice';

const OverwriteDuplicateSubmissionsDialog = (size: number) => {
  return {
    title: `${size} duplicate submissions found!`,
    text: `Are you sure you want to overwrite ${size} submissions? This will erase the correction progress of the submissions. This cannot be undone!`,
    onConfirm: (dispatch) => {
      dispatch(overwriteConflictedCorrections());
    },
    onReject: (dispatch) => {
      dispatch(resetImportConflicts());
    },
  };
};

export default OverwriteDuplicateSubmissionsDialog;
