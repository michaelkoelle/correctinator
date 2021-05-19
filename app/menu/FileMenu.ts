import { OpenDialogReturnValue, remote, SaveDialogReturnValue } from 'electron';
import fs from 'fs';
import * as Path from 'path';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import UnsavedChangesDialog from '../dialogs/UnsavedChangesDialog';
import {
  workspaceRemoveOnePath,
  workspaceSetPath,
} from '../features/workspace/workspaceSlice';
import ExportModal from '../modals/ExportModal';
import ImportModal from '../modals/ImportModal';

import {
  createNewCorFile,
  openDirectory,
  reloadState,
  save,
  saveAllCorrectionsAs,
} from '../utils/FileAccess';

const buildFileMenu = (
  dispatch,
  showModal,
  workspace,
  sheets,
  unsavedChanges,
  recentPaths,
  setOpenFileError
) => {
  const unsavedChangesDialog = (path) => {
    if (unsavedChanges) {
      showModal(ConfirmationDialog, UnsavedChangesDialog(path));
    } else {
      dispatch(workspaceSetPath(path));
      dispatch(reloadState());
    }
  };
  const backupPaths = fs
    .readdirSync(Path.join(remote.app.getPath('userData'), 'Backup'))
    .filter((p) => workspace && p.includes(Path.basename(workspace)));

  return {
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
        disabled: recentPaths.length <= 0,
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
        label: 'Restore Backup',
        disabled: backupPaths.length <= 0,
        submenu: backupPaths.map((path) => {
          return {
            label: path,
            click: async () => {
              const fullPath = Path.join(
                remote.app.getPath('userData'),
                'Backup',
                path
              );
              if (fs.existsSync(fullPath)) {
                showModal(ConfirmationDialog, {
                  title: 'Restore Backup?',
                  text: `Do you really want to restore backup "${path}"?`,
                  onConfirm: () => {
                    fs.renameSync(fullPath, workspace);
                    dispatch(reloadState());
                  },
                });
              }
            },
          };
        }),
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
                showModal(ImportModal, { path });
              }
            },
          },
          {
            label: 'From Folder',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: async () => {
              const path: string = await openDirectory();
              if (path) {
                showModal(ImportModal, { path });
              }
            },
          },
        ],
      },
      {
        label: 'Export Corrections',
        disabled: sheets.length <= 0,
        submenu: sheets.map((s) => {
          return {
            label: s.name,
            click: async () => {
              showModal(ExportModal, { sheetId: s.id });
            },
          };
        }),
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+W',
        click: () => {
          remote.getCurrentWindow().close();
        },
      },
    ],
  };
};

export default buildFileMenu;
