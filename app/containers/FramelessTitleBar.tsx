import React, { useEffect, useState } from 'react';
import fse from 'fs-extra';
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
} from '@material-ui/core';
import { remote, shell } from 'electron';
import ReleaseNotes from '../components/ReleaseNotes';
import {
  deleteEverythingInDir,
  exportWorkspace,
  openDirectory,
  reloadState,
  saveAllCorrections,
} from '../utils/FileAccess';
import {
  selectWorkspacePath,
  workspaceSetPath,
} from '../features/workspace/workspaceSlice';
import { selectUnsavedChanges } from '../model/SaveSlice';
import ConfirmDialog from '../components/ConfirmDialog';

const { version } = require('../package.json');

const currentWindow = remote.getCurrentWindow();

export default function FramelessTitleBar(props: any) {
  const dispatch = useDispatch();
  const workspace: string = useSelector(selectWorkspacePath);
  const unsavedChanges: boolean = useSelector(selectUnsavedChanges);
  const [oldPath, setOldPath] = useState<string>(workspace);
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  const [openMoveFilesDialog, setOpenMoveFilesDialog] = useState<boolean>(
    false
  );
  const [openResetConfirmDialog, setOpenResetConfirmDialog] = useState<boolean>(
    false
  );
  const [versionInfo, setVersionInfo] = useState({
    releaseNotes: '',
    releaseName: '',
  });
  const [open, setOpen] = useState(false);
  const { theme } = props;

  function onCloseReleaseNotes() {
    setOpen(false);
  }

  /*
  remote.globalShortcut.register('CommandOrControl+S', () => {
    dispatch(saveAllCorrections());
  });
*/
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
          label: 'Workspace',
          submenu: [
            {
              label: 'Open/Change directory',
              click: async () => {
                const dir: string = await openDirectory();
                setOldPath(workspace);
                dispatch(saveAllCorrections());
                const filesToCopy: string[] = fse.readdirSync(workspace);
                dispatch(workspaceSetPath(dir));
                if (filesToCopy.length > 0) {
                  setOpenMoveFilesDialog(true);
                }
                dispatch(reloadState(dir));
              },
            },
            {
              label: 'Export workspace',
              click: () => {
                const defaultPath = 'workspace.zip';
                const p = remote.dialog.showSaveDialogSync(
                  remote.getCurrentWindow(),
                  {
                    defaultPath,
                    filters: [{ name: 'Zip', extensions: ['zip'] }],
                  }
                );
                if (p) {
                  exportWorkspace(p, workspace);
                }
              },
            },
            {
              label: `Show Directory in ${
                process.platform !== 'darwin' ? 'File Explorer' : 'Finder'
              }`,
              click: async () => {
                shell.openPath(workspace);
              },
            },
            {
              label: 'Reset Workspace',
              click: async () => {
                setOpenResetConfirmDialog(true);
              },
            },
          ],
        },
        {
          label: 'Save',
          accelerator: 'CommandOrControl+S',
          click: () => {
            dispatch(saveAllCorrections());
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
            console.log(
              await remote
                .require('electron-updater')
                .autoUpdater.checkForUpdates()
            );
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
        title={`correctinator v${version}${unsavedChanges ? ' •' : ''}`}
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
      <Dialog
        open={openMoveFilesDialog}
        onClose={() => setOpenMoveFilesDialog(false)}
      >
        <DialogTitle>Move old submissions?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to move your old submissions to the new workspace?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (oldPath !== undefined) {
                const filesToCopy: string[] = fse.readdirSync(oldPath);
                filesToCopy?.forEach((file) => {
                  const from = Path.join(oldPath, file);
                  const to = Path.join(workspace, Path.parse(file).base);
                  console.log(`${from} --> ${to}`);
                  fse.moveSync(from, to);
                });
                dispatch(reloadState(workspace));
              }
              setOpenMoveFilesDialog(false);
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              setOpenMoveFilesDialog(false);
            }}
            color="primary"
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        title="Are you sure?"
        text="Do you really want to reset the workspace, all corrections will be deleted. Make sure you export them first."
        onConfirm={() => {
          deleteEverythingInDir(workspace);
          dispatch(reloadState(workspace));
          setOpenResetConfirmDialog(false);
        }}
        onReject={() => {
          setOpenResetConfirmDialog(false);
        }}
        open={openResetConfirmDialog}
        setOpen={setOpenResetConfirmDialog}
      />
    </div>
  );
}
