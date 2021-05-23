/* eslint-disable no-new */
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
import { app, BrowserWindow, ipcMain } from 'electron';
import MenuBuilder from './menu';
import AppUpdater from './updater';
import Backup from './backup';
import Exporter from './exporter';
import Importer from './importer';
import AutoCorrection from './autocorrection';
import { RECEIVE_FILE_PATH, REQUEST_FILE_PATH } from './constants/OpenFileIPC';

let mainWindow: BrowserWindow | null = null;
let file = '';

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

  ipcMain.on('bg-ready', (event, win) => {
    const { sender } = event;
    console.log('Background worker ready!', win);
    sender.send('transferMainWindow', 'test');
    // send reference to main window
  });

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

  new AppUpdater();
  new Backup();
  new Importer(mainWindow);
  new Exporter();
  new AutoCorrection();
};

const openWithFileHandler = (argv: string[]) => {
  const arg: string | undefined = argv.find((a) => path.extname(a) === '.cor');

  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    if (arg) {
      mainWindow.webContents.send(RECEIVE_FILE_PATH, arg);
    }
  }
};

/**
 * Add event listeners...
 */

ipcMain.on(REQUEST_FILE_PATH, () => {
  if (process.platform === 'win32') {
    openWithFileHandler(process.argv);
  } else {
    openWithFileHandler([file]);
  }
});

app.on('open-file', (_event, filePath) => {
  if (mainWindow === null) createWindow();
  if (process.platform !== 'win32') {
    file = filePath;
    openWithFileHandler([filePath]);
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
  app.on('second-instance', (_event, argv) => openWithFileHandler(argv));

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
