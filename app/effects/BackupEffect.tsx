import { ipcRenderer } from 'electron';
import { EffectCallback } from 'react';
import { BACKUP_START, BACKUP_STOP } from '../constants/BackupIPC';

const BackupEffect = (
  workspacePath: string,
  saveBackups: boolean
): EffectCallback => {
  return () => {
    // Start Backup
    if (workspacePath.length > 0 && saveBackups) {
      ipcRenderer.send(BACKUP_START, workspacePath);
    }
    return () => {
      // Stop Backup
      ipcRenderer.send(BACKUP_STOP);
    };
  };
};

export default BackupEffect;
