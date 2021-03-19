/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import MenuBuilder from './menu';
import * as IPCConstants from './constants/ipc';

class AppUpdater {
  constructor() {
    autoUpdater.autoDownload = false;
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    icon: getAssetPath('icon.png'),
    minWidth: 800, // set a min width!
    minHeight: 600, // and a min height!
    // Remove the window frame from windows applications
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // eslint-disable-next-line no-new
  new AppUpdater();
};

/**
 * Add event listeners...
 */

ipcMain.on(IPCConstants.CHECK_FOR_UPDATE_PENDING, (event) => {
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
});

ipcMain.on(IPCConstants.DOWNLOAD_UPDATE_PENDING, (event) => {
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
});

ipcMain.on(IPCConstants.QUIT_AND_INSTALL_UPDATE, () => {
  if (!(process.env.NODE_ENV === 'development')) {
    autoUpdater.quitAndInstall(
      true, // isSilent
      true // isForceRunAfter, restart app after update is installed
    );
  }
});

ipcMain.on(IPCConstants.REQUEST_FILE_PATH, (event) => {
  const { sender } = event;
  if (process.argv.length >= 3) {
    sender.send(IPCConstants.RECEIVE_FILE_PATH, process.argv[2]);
  }
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      if (argv.length >= 3 && path.extname(argv[2]) === '.cor') {
        mainWindow.webContents.send(IPCConstants.RECEIVE_FILE_PATH, argv[2]);
      }
    }
  });

  // Create myWindow, load the rest of the app, etc...
  if (process.env.E2E_BUILD === 'true') {
    // eslint-disable-next-line promise/catch-or-return
    app.whenReady().then(createWindow);
  } else {
    app.on('ready', createWindow);
  }
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
