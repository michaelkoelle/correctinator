import { ipcRenderer } from 'electron';
import { UpdateInfo } from 'electron-updater';
import {
  CHECK_FOR_UPDATE_PENDING,
  CHECK_FOR_UPDATE_SUCCESS,
  REQUEST_FILE_PATH,
} from '../constants/ipc';
import UpdaterModal from '../modals/UpdaterModal';
import { version as currentAppVersion } from '../package.json';

const CheckForUpdatesEffect = (showModal) => {
  return () => {
    ipcRenderer.on(
      CHECK_FOR_UPDATE_SUCCESS,
      (_event, info: UpdateInfo | undefined) => {
        const version = info && info.version;
        if (version && version !== currentAppVersion) {
          // Show updater dialog
          showModal(UpdaterModal, { showNotAvailiable: false });
        }
      }
    );

    // Check for updates at start
    ipcRenderer.send(CHECK_FOR_UPDATE_PENDING);
    // Get file path
    ipcRenderer.send(REQUEST_FILE_PATH);

    return () => {
      ipcRenderer.removeAllListeners(CHECK_FOR_UPDATE_SUCCESS);
    };
  };
};

export default CheckForUpdatesEffect;
