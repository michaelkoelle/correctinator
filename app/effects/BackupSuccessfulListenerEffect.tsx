import { ipcRenderer } from 'electron';
import { BACKUP_SUCCESSFUL } from '../constants/BackupIPC';

const BackupSuccessfulListenerEffect = (setBackupFilePaths) => {
  return () => {
    ipcRenderer.on(BACKUP_SUCCESSFUL, setBackupFilePaths);
    return () => {
      ipcRenderer.removeListener(BACKUP_SUCCESSFUL, setBackupFilePaths);
    };
  };
};

export default BackupSuccessfulListenerEffect;
