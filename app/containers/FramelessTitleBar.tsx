import React, { useEffect, useState } from 'react';
import fs from 'fs';
import TitleBar from 'frameless-titlebar';
import 'setimmediate';
import * as Path from 'path';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  Snackbar,
} from '@material-ui/core';
import {
  OpenDialogReturnValue,
  remote,
  SaveDialogReturnValue,
  shell,
} from 'electron';
import { Alert } from '@material-ui/lab';
import ReleaseNotes from '../components/ReleaseNotes';
import {
  createNewCorFile,
  deleteEverythingInDir,
  reloadState,
  saveAllCorrections,
  saveAllCorrectionsAs,
} from '../utils/FileAccess';
import {
  selectRecentPaths,
  selectWorkspacePath,
  workspaceRemoveOnePath,
  workspaceSetPath,
} from '../features/workspace/workspaceSlice';
import { selectUnsavedChanges } from '../model/SaveSlice';
import ConfirmDialog from '../components/ConfirmDialog';
import { version } from '../package.json';

const currentWindow = remote.getCurrentWindow();

export default function FramelessTitleBar(props: {
  setOpenUpdater: (boolean) => void;
}) {
  const dispatch = useDispatch();
  const { setOpenUpdater } = props;
  const theme = useTheme();
  const workspace: string = useSelector(selectWorkspacePath);
  const recentPaths: string[] = useSelector(selectRecentPaths);
  const unsavedChanges: boolean = useSelector(selectUnsavedChanges);
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  const [openResetConfirmDialog, setOpenResetConfirmDialog] = useState<boolean>(
    false
  );
  const [openFileError, setOpenFileError] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] = useState({
    releaseNotes: '',
    releaseName: '',
  });
  const [open, setOpen] = useState(false);

  function onCloseReleaseNotes() {
    setOpen(false);
  }

  useEffect(() => {
    const acceleratorListener = (event) => {
      // Save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        dispatch(saveAllCorrections());
      }
    };
    window.addEventListener('keydown', acceleratorListener, true);
    return () => {
      window.removeEventListener('keydown', acceleratorListener, true);
    };
  }, []);

  // add window listeners for currentWindow
  useEffect(() => {
    const onMaximized = () => setMaximized(true);
    const onRestore = () => setMaximized(false);
    currentWindow.on('maximize', onMaximized);
    currentWindow.on('unmaximize', onRestore);
    return () => {
      currentWindow.removeListener('maximize', onMaximized);
      currentWindow.removeListener('unmaximize', onRestore);
    };
  }, []);

  // used by double click on the titlebar
  // and by the maximize control button
  const handleMaximize = () => {
    if (maximized) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  };

  const templateDefault: any[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New corrections file',
          accelerator: 'CommandOrControl+N',
          click: async () => {
            const returnValue: SaveDialogReturnValue = await remote.dialog.showSaveDialog(
              remote.getCurrentWindow(),
              {
                filters: [{ name: 'Correctinator', extensions: ['cor'] }],
              }
            );

            if (returnValue.canceled || !returnValue.filePath) {
              throw new Error('No directory selected');
            }

            const dir: string = returnValue.filePath;
            dispatch(saveAllCorrections());
            createNewCorFile(dir);
            dispatch(workspaceSetPath(dir));
            dispatch(reloadState());
          },
        },
        {
          label: 'Open corrections',
          accelerator: 'CommandOrControl+O',
          click: async () => {
            const returnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog(
              remote.getCurrentWindow(),
              {
                filters: [{ name: 'Correctinator', extensions: ['cor'] }],
                properties: ['openFile'],
              }
            );

            if (returnValue.canceled || returnValue.filePaths.length !== 1) {
              throw new Error('No directory selected');
            }
            const dir: string = returnValue.filePaths[0];
            dispatch(saveAllCorrections());
            dispatch(workspaceSetPath(dir));
            dispatch(reloadState());
          },
        },
        {
          label: 'Open recent corrections',
          submenu: recentPaths
            ? recentPaths.map((path) => {
                return {
                  label: path,
                  click: async () => {
                    if (fs.existsSync(path)) {
                      dispatch(saveAllCorrections());
                      dispatch(workspaceSetPath(path));
                      dispatch(reloadState());
                    } else {
                      // Path doesnt exist anymore
                      setOpenFileError(true);
                      dispatch(workspaceRemoveOnePath(path));
                    }
                  },
                };
              })
            : [],
        },
        {
          label: 'Save corrections',
          accelerator: 'CommandOrControl+S',
          click: () => {
            dispatch(saveAllCorrections());
          },
        },
        {
          label: 'Save as',
          accelerator: 'CommandOrControl+Shift+S',
          click: async () => {
            const returnValue: SaveDialogReturnValue = await remote.dialog.showSaveDialog(
              remote.getCurrentWindow(),
              {
                defaultPath: workspace,
                filters: [{ name: 'Correctinator', extensions: ['cor'] }],
              }
            );

            if (returnValue.canceled || !returnValue.filePath) {
              throw new Error('No directory selected');
            }

            const dir: string = returnValue.filePath;
            dispatch(saveAllCorrectionsAs(dir));
            dispatch(reloadState());
          },
        },
        {
          label: 'Close correction',
          click: async () => {
            dispatch(saveAllCorrections());
            dispatch(workspaceSetPath(''));
            dispatch(reloadState());
          },
        },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            currentWindow.close();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu:
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
          ? [
              {
                label: 'Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  currentWindow.webContents.reload();
                },
              },
              {
                label: 'Toggle Full Screen',
                accelerator: 'F11',
                click: () => {
                  currentWindow.setFullScreen(!currentWindow.isFullScreen());
                },
              },
              {
                label: 'Toggle Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  currentWindow.webContents.toggleDevTools();
                },
              },
              {
                label: 'Dark Mode',
                accelerator: 'F12',
                type: 'checkbox',
                checked: remote?.nativeTheme?.shouldUseDarkColors,
                click: () => {
                  remote.nativeTheme.themeSource = remote.nativeTheme
                    .shouldUseDarkColors
                    ? 'light'
                    : 'dark';
                },
              },
            ]
          : [
              {
                label: 'Toggle Full Screen',
                accelerator: 'F11',
                click: () => {
                  currentWindow.setFullScreen(!currentWindow.isFullScreen());
                },
              },
              {
                label: 'Dark Mode',
                accelerator: 'F12',
                type: 'checkbox',
                checked: remote?.nativeTheme?.shouldUseDarkColors,
                click: () => {
                  remote.nativeTheme.themeSource = remote.nativeTheme
                    .shouldUseDarkColors
                    ? 'light'
                    : 'dark';
                },
              },
              {
                label: 'Toggle Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  currentWindow.webContents.toggleDevTools();
                },
              },
            ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for updates',
          async click() {
            setOpenUpdater(true);
          },
        },
        {
          label: 'View Release Notes',
          async click() {
            setOpen(true);
            const info = await remote
              .require('electron-updater')
              .autoUpdater.checkForUpdates();
            if (info === undefined) {
              setOpen(false);
            }
            setVersionInfo(info.versionInfo);
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/koellemichael/correctinator#readme'
            );
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal(
              'https://github.com/koellemichael/correctinator/issues'
            );
          },
        },
      ],
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'fixed',
          left: '60px',
          width: 'calc(100% - 40px)',
          height: '28px',
          boxShadow: '2px 0px 5px 0px rgba(0,0,0,0.2)',
          zIndex: -9999,
        }}
      />
      <TitleBar
        iconSrc="../resources/icon.ico" // app icon
        currentWindow={currentWindow} // electron window instance
        // platform={process.platform} // win32, darwin, linux
        menu={templateDefault}
        theme={{
          bar: {
            color: theme.palette.text.primary,
            background: theme.palette.background.paper,
            borderBottom: 'none',
          },
          ...theme,
          menu: {
            palette: remote.nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
            overlay: {
              opacity: 0.0,
            },
          },
        }}
        title={`${
          workspace.length > 0 ? `${Path.parse(workspace).name} - ` : ''
        }correctinator v${version}${unsavedChanges ? ' •' : ''}`}
        onClose={() => currentWindow.close()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={handleMaximize}
        // when the titlebar is double clicked
        onDoubleClick={handleMaximize}
        // hide minimize windows control
        disableMinimize={false}
        // hide maximize windows control
        disableMaximize={false}
        // is the current window maximized?
        maximized={maximized}
      >
        {/* custom titlebar items */}
      </TitleBar>
      <ReleaseNotes
        open={open}
        title={versionInfo?.releaseName}
        releaseNotes={versionInfo?.releaseNotes}
        handleClose={onCloseReleaseNotes}
      />
      <ConfirmDialog
        title="Are you sure?"
        text="Do you really want to reset the workspace, all corrections will be deleted. Make sure you export them first."
        onConfirm={() => {
          deleteEverythingInDir(workspace);
          dispatch(reloadState());
          setOpenResetConfirmDialog(false);
        }}
        onReject={() => {
          setOpenResetConfirmDialog(false);
        }}
        open={openResetConfirmDialog}
        setOpen={setOpenResetConfirmDialog}
      />
      <Snackbar
        open={openFileError}
        autoHideDuration={3000}
        onClose={() => setOpenFileError(false)}
      >
        <Alert onClose={() => setOpenFileError(false)} severity="error">
          File does not exist anymore!
        </Alert>
      </Snackbar>
    </div>
  );
}
