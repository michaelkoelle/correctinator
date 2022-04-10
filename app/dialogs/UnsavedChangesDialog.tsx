import { workspaceSetPath } from '../slices/WorkspaceSlice';
import { reloadState, save } from '../utils/FileAccess';

const UnsavedChangesDialog = (newFilePath) => {
  return {
    title: 'Unsaved changes',
    text: 'Do you want to save your changes, before loading a new file?',
    onConfirm: (dispatch) => {
      dispatch(save());
      dispatch(workspaceSetPath(newFilePath));
      dispatch(reloadState());
    },
    onReject: (dispatch) => {
      dispatch(workspaceSetPath(newFilePath));
      dispatch(reloadState());
    },
  };
};

export default UnsavedChangesDialog;
