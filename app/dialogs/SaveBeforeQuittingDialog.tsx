import { remote } from 'electron';
import { save } from '../utils/FileAccess';

const SaveBeforeQuittingDialog = (setQuitAnyways) => {
  return {
    title: 'Save before quitting?',
    text: 'Do you want to save your changes before quitting?',
    onConfirm: (dispatch) => {
      dispatch(save());
      setQuitAnyways(false);
      remote.getCurrentWindow().close();
    },
    onReject: () => {
      setQuitAnyways(true);
      remote.getCurrentWindow().close();
    },
    onCancel: () => {
      setQuitAnyways(false);
    },
  };
};

export default SaveBeforeQuittingDialog;
