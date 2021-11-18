import { ipcRenderer } from 'electron';
import { EffectCallback } from 'react';
import { OPEN_LAUNCHER } from '../constants/WindowIPC';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import SaveBeforeQuittingDialog from '../dialogs/SaveBeforeQuittingDialog';

const SaveBeforeQuittingEffect = (
  quitAnyways,
  setQuitAnyways,
  reload,
  setReload,
  showModal,
  unsavedChanges
): EffectCallback => {
  return () => {
    const beforeQuit = (e: BeforeUnloadEvent) => {
      if (reload) {
        setReload(false);
      } else if (unsavedChanges && !quitAnyways) {
        e.returnValue = false;
        e.preventDefault();
        showModal(ConfirmationDialog, SaveBeforeQuittingDialog(setQuitAnyways));
      } else {
        e.preventDefault();
        ipcRenderer.send(OPEN_LAUNCHER);
      }
    };
    window.addEventListener('beforeunload', beforeQuit, true);
    return () => {
      window.removeEventListener('beforeunload', beforeQuit, true);
    };
  };
};

export default SaveBeforeQuittingEffect;
