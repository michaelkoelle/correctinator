import { ipcRenderer } from 'electron';
import { correctionPageSetSheetId } from '../slices/CorrectionPageSlice';
import { setTabIndex } from '../slices/HomeSlice';
import SheetEntity from '../model/SheetEntity';
import Task from '../model/Task';
import { getRateableTasks, isSingleChoiceTask } from '../utils/TaskUtil';
import ConfirmationDialog from './ConfirmationDialog';
import SuggestAutoCorrectionDialog from './SuggestAutoCorrectionDialog';
import { OPEN_MAIN_WINDOW } from '../constants/WindowIPC';

const StartCorrectionDialog = (
  showModal,
  close,
  selectedSheet: SheetEntity,
  tasks: Task[]
) => {
  const autoCorrectionAvailiable =
    tasks &&
    getRateableTasks(tasks).filter((t) => isSingleChoiceTask(t)).length !== 0;

  const onStartCorrection = (dispatch) => {
    if (selectedSheet?.id !== undefined) {
      dispatch(correctionPageSetSheetId(selectedSheet?.id));
      dispatch(setTabIndex(3));
      ipcRenderer.send(OPEN_MAIN_WINDOW);

      if (autoCorrectionAvailiable) {
        showModal(
          ConfirmationDialog,
          SuggestAutoCorrectionDialog(showModal, close, selectedSheet)
        );
      } else {
        // close parent modal
        close();
      }
    }
  };

  return {
    title: 'Start correcting right away?',
    text: `Do you want to start correcting the sheet "${selectedSheet?.name}" now?`,
    onConfirm: (dispatch) => {
      onStartCorrection(dispatch);
    },
  };
};

export default StartCorrectionDialog;
