import React, { useEffect, useState } from 'react';
import fs from 'fs';
import TitleBar from 'frameless-titlebar';
import 'setimmediate';
import * as Path from 'path';
import { useSelector } from 'react-redux';
import { useTheme, Snackbar } from '@material-ui/core';
import {
  OpenDialogReturnValue,
  remote,
  SaveDialogReturnValue,
  shell,
} from 'electron';
import { Alert } from '@material-ui/lab';
import { unwrapResult } from '@reduxjs/toolkit';
import ReleaseNotes from '../components/ReleaseNotes';
import {
  createNewCorFile,
  deleteEverythingInDir,
  openDirectory,
  reloadState,
  save,
  saveAllCorrectionsAs,
} from '../utils/FileAccess';
import {
  selectRecentPaths,
  selectWorkspacePath,
  workspaceRemoveOnePath,
} from '../features/workspace/workspaceSlice';
import { selectUnsavedChanges } from '../model/SaveSlice';
import ConfirmDialog from '../components/ConfirmDialog';
import { version } from '../package.json';
import {
  selectSettings,
  settingsSetTheme,
  SettingsState,
} from '../model/SettingsSlice';
import { importCorrections } from '../model/SheetOverviewSlice';
import { ParserType } from '../parser/Parser';
import { selectAllSheets } from '../model/SheetSlice';
import { selectCorrectionsBySheetId } from '../model/Selectors';
import ExportDialog from '../components/ExportDialog';
import { useAppDispatch } from '../store';
import { shouldUseDarkColors, Theme } from '../model/Theme';

const currentWindow = remote.getCurrentWindow();

export default function FramelessTitleBar(props: {
  setOpenUpdater: (boolean) => void;
  unsavedChangesDialog: (string) => void;
  setReload: (boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const { setOpenUpdater, unsavedChangesDialog, setReload } = props;
  const theme = useTheme();
  const workspace: string = useSelector(selectWorkspacePath);
  const settings: SettingsState = useSelector(selectSettings);
  const recentPaths: string[] = useSelector(selectRecentPaths);
  const sheets = useSelector(selectAllSheets);
  const [exportSheetId, setExportSheetId] = useState<string>();
  const corrections = useSelector(selectCorrectionsBySheetId(exportSheetId));
  const unsavedChanges: boolean = useSelector(selectUnsavedChanges);
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());
  const [openResetConfirmDialog, setOpenResetConfirmDialog] = useState<boolean>(
    false
  );
  const [openFileError, setOpenFileError] = useState<boolean>(false);
  const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] = useState({
    releaseNotes: '',
    releaseName: '',
  });
  const [openReleaseNotes, setOpenReleaseNotes] = useState(false);

  useEffect(() => {
    const acceleratorListener = (event) => {
      // Save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        dispatch(save());
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
          label: 'New file',
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

            const path: string = returnValue.filePath;
            createNewCorFile(path);
            unsavedChangesDialog(path);
          },
        },
        {
          label: 'Open file',
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
            const path: string = returnValue.filePaths[0];
            unsavedChangesDialog(path);
          },
        },
        {
          label: 'Open recent files',
          submenu: recentPaths
            ? recentPaths.map((path) => {
                return {
                  label: path,
                  click: async () => {
                    if (fs.existsSync(path)) {
                      unsavedChangesDialog(path);
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
          label: 'Save',
          accelerator: 'CommandOrControl+S',
          click: () => {
            dispatch(save());
          },
        },
        {
          label: 'Save as',
          accelerator: 'CommandOrControl+Shift+S',
          click: async () => {
            dispatch(saveAllCorrectionsAs());
          },
        },
        {
          label: 'Discard changes',
          accelerator: 'CommandOrControl+Shift+D',
          click: async () => {
            dispatch(reloadState());
          },
        },
        {
          label: 'Close file',
          click: async () => {
            unsavedChangesDialog('');
          },
        },
        { type: 'separator' },
        {
          label: 'Import Submissions',
          submenu: [
            {
              label: 'From ZIP',
              accelerator: 'CmdOrCtrl+I',
              click: async () => {
                const dialogReturnValue = await remote.dialog.showOpenDialog({
                  filters: [{ name: 'Zip', extensions: ['zip'] }],
                  properties: ['openFile'],
                });
                const path = dialogReturnValue.filePaths[0];
                if (path) {
                  dispatch(
                    importCorrections({ path, parserType: ParserType.Uni2Work })
                  )
                    .then(unwrapResult)
                    .then((originalPromiseResult) => {
                      if (settings.autosave) {
                        dispatch(save());
                      }
                      return originalPromiseResult;
                    })
                    .catch((rejectedValueOrSerializedError) => {
                      console.log(rejectedValueOrSerializedError);
                    });
                }
              },
            },
            {
              label: 'From Folder',
              accelerator: 'CmdOrCtrl+Shift+I',
              click: async () => {
                const path: string = await openDirectory();
                dispatch(
                  importCorrections({ path, parserType: ParserType.Uni2Work })
                )
                  .then(unwrapResult)
                  .then((originalPromiseResult) => {
                    if (settings.autosave) {
                      dispatch(save());
                    }
                    return originalPromiseResult;
                  })
                  .catch((rejectedValueOrSerializedError) => {
                    console.log(rejectedValueOrSerializedError);
                  });
              },
            },
          ],
        },
        {
          label: 'Export Corrections',
          submenu: sheets.map((s) => {
            return {
              label: s.name,
              click: async () => {
                setOpenExportDialog(true);
                setExportSheetId(s.id);
              },
            };
          }),
        },
        { type: 'separator' },
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
                  setReload(true);
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
                label: 'Theme',
                submenu: [
                  {
                    label: 'Dark',
                    type: 'checkbox',
                    checked: settings.theme === Theme.DARK,
                    click: () => {
                      dispatch(settingsSetTheme(Theme.DARK));
                    },
                  },
                  {
                    label: 'Light',
                    type: 'checkbox',
                    checked: settings.theme === Theme.LIGHT,
                    click: () => {
                      dispatch(settingsSetTheme(Theme.LIGHT));
                    },
                  },
                  {
                    label: 'System',
                    type: 'checkbox',
                    checked: settings.theme === Theme.SYSTEM,
                    click: () => {
                      dispatch(settingsSetTheme(Theme.SYSTEM));
                    },
                  },
                ],
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
                label: 'Theme',
                submenu: [
                  {
                    label: 'Dark',
                    type: 'checkbox',
                    checked: settings.theme === Theme.DARK,
                    click: () => {
                      dispatch(settingsSetTheme(Theme.DARK));
                    },
                  },
                  {
                    label: 'Light',
                    type: 'checkbox',
                    checked: settings.theme === Theme.LIGHT,
                    click: () => {
                      dispatch(settingsSetTheme(Theme.LIGHT));
                    },
                  },
                  {
                    label: 'System',
                    type: 'checkbox',
                    checked: settings.theme === Theme.SYSTEM,
                    click: () => {
                      dispatch(settingsSetTheme(Theme.SYSTEM));
                    },
                  },
                ],
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
            setOpenReleaseNotes(true);
            const info = await remote
              .require('electron-updater')
              .autoUpdater.checkForUpdates();
            if (info === undefined) {
              setOpenReleaseNotes(false);
            }
            setVersionInfo(info.versionInfo);
          },
        },
        { type: 'separator' },
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
            palette: shouldUseDarkColors(settings.theme) ? 'dark' : 'light',
            overlay: {
              opacity: 0.0,
            },
            separator: {
              color: theme.palette.divider,
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
        open={openReleaseNotes}
        title={versionInfo?.releaseName}
        releaseNotes={versionInfo?.releaseNotes}
        handleClose={() => setOpenReleaseNotes(false)}
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
      <ExportDialog
        open={openExportDialog}
        handleClose={() => {
          setOpenExportDialog(false);
          setExportSheetId(undefined);
        }}
        correctionsToExport={corrections}
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
