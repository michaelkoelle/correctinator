import { ipcRenderer } from 'electron';
import * as Path from 'path';
import { RECEIVE_FILE_PATH } from '../constants/OpenFileIPC';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import UnsavedChangesDialog from '../dialogs/UnsavedChangesDialog';
import { workspaceSetPath } from '../slices/WorkspaceSlice';
import { reloadState } from '../utils/FileAccess';

const LoadNewFileEffect = (dispatch, showModal, unsavedChanges) => {
  return () => {
    const loadNewFile = (_event, path) => {
      if (Path.extname(path) === '.cor') {
        if (unsavedChanges) {
          showModal(ConfirmationDialog, UnsavedChangesDialog(path));
        } else {
          dispatch(workspaceSetPath(path));
          dispatch(reloadState());
        }
      }
    };

    ipcRenderer.on(RECEIVE_FILE_PATH, loadNewFile);
    return () => {
      ipcRenderer.removeListener(RECEIVE_FILE_PATH, loadNewFile);
    };
  };
};

export default LoadNewFileEffect;
