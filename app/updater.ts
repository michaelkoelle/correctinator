import fs from 'fs';
import path from 'path';
import { ipcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import * as IPCConstants from './constants/ipc';

export default class AppUpdater {
  constructor() {
    autoUpdater.autoDownload = false;
    // autoUpdater.fullChangelog = true;

    ipcMain.on(
      IPCConstants.CHECK_FOR_UPDATE_PENDING,
      AppUpdater.checkForUpdatePending
    );
    ipcMain.on(
      IPCConstants.DOWNLOAD_UPDATE_PENDING,
      AppUpdater.downloadUpdatePending
    );
    ipcMain.on(
      IPCConstants.QUIT_AND_INSTALL_UPDATE,
      AppUpdater.quitAndInstallUpdate
    );
  }

  static checkForUpdatePending(event) {
    const { sender } = event;

    // Automatically invoke success on development environment.
    if (
      process.env.NODE_ENV === 'development' &&
      !fs.existsSync(path.join(__dirname, 'dev-app-update.yml'))
    ) {
      sender.send(IPCConstants.CHECK_FOR_UPDATE_SUCCESS);
    } else {
      const result = autoUpdater.checkForUpdates();

      result
        .then((checkResult: UpdateCheckResult) => {
          const { updateInfo } = checkResult;
          sender.send(IPCConstants.CHECK_FOR_UPDATE_SUCCESS, updateInfo);
          return checkResult;
        })
        .catch((e) => {
          sender.send(IPCConstants.CHECK_FOR_UPDATE_FAILURE, e.message);
        });
    }
  }

  static downloadUpdatePending(event) {
    const { sender } = event;
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => sender.send(IPCConstants.DOWNLOAD_UPDATE_SUCCESS), 3000);
    } else {
      const updateProgress = (progressObj) => {
        sender.send(IPCConstants.DOWNLOAD_UPDATE_PROGRESS, progressObj.percent);
      };
      autoUpdater.on('download-progress', updateProgress);
      const result = autoUpdater.downloadUpdate();
      result
        .then(() => {
          sender.send(IPCConstants.DOWNLOAD_UPDATE_SUCCESS);
          autoUpdater.removeListener('download-progress', updateProgress);
          return undefined;
        })
        .catch((e) => {
          sender.send(IPCConstants.DOWNLOAD_UPDATE_FAILURE, e.message);
          autoUpdater.removeListener('download-progress', updateProgress);
        });
    }
  }

  static quitAndInstallUpdate() {
    if (!(process.env.NODE_ENV === 'development')) {
      autoUpdater.quitAndInstall(
        true, // isSilent
        true // isForceRunAfter, restart app after update is installed
      );
    }
  }
}
