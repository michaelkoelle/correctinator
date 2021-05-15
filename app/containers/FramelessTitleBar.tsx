import React, { useEffect, useState } from 'react';
import fs from 'fs';
import TitleBar from 'frameless-titlebar';
import 'setimmediate';
import * as Path from 'path';
import { useSelector } from 'react-redux';
import { useTheme, Snackbar } from '@material-ui/core';
import { ipcRenderer, remote } from 'electron';
import { Alert } from '@material-ui/lab';
import ReleaseNotes from '../components/ReleaseNotes';
import { save } from '../utils/FileAccess';
import {
  selectRecentPaths,
  selectWorkspacePath,
} from '../features/workspace/workspaceSlice';
import { selectUnsavedChanges } from '../model/SaveSlice';
import { version } from '../package.json';
import { selectSettings, SettingsState } from '../model/SettingsSlice';
import { selectAllSheets } from '../model/SheetSlice';
import { selectCorrectionsBySheetId } from '../model/Selectors';
import ExportDialog from '../components/ExportDialog';
import { useAppDispatch } from '../store';
import { shouldUseDarkColors } from '../model/Theme';
import { BACKUP_SUCCESSFUL } from '../constants/BackupIPC';
import buildMenu from '../menu/Menu';
import { useModal } from '../dialogs/ModalProvider';

const currentWindow = remote.getCurrentWindow();

export default function FramelessTitleBar(props: {
  setOpenUpdater: (boolean) => void;
  unsavedChangesDialog: (string) => void;
  setReload: (boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const showModal = useModal();
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
  const [openFileError, setOpenFileError] = useState<boolean>(false);
  const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
  const [versionInfo, setVersionInfo] = useState({
    releaseNotes: '',
    releaseName: '',
  });
  const [openReleaseNotes, setOpenReleaseNotes] = useState(false);
  const [backupPaths, setBackupPaths] = useState<string[]>([]);

  useEffect(() => {
    const acceleratorListener = (event) => {
      // Save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        dispatch(save());
      }
    };
    window.addEventListener('keydown', acceleratorListener, true);

    const setBackupFilePaths = () => {
      const paths = fs
        .readdirSync(Path.join(remote.app.getPath('userData'), 'Backup'))
        .filter((p) => p.includes(Path.basename(workspace)));
      setBackupPaths(paths);
    };

    ipcRenderer.on(BACKUP_SUCCESSFUL, setBackupFilePaths);
    return () => {
      ipcRenderer.removeListener(BACKUP_SUCCESSFUL, setBackupFilePaths);
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
        iconSrc="../resources/titlebar.png" // app icon
        currentWindow={currentWindow} // electron window instance
        // platform={process.platform} // win32, darwin, linux
        menu={
          buildMenu(
            dispatch,
            showModal,
            workspace,
            settings,
            sheets,
            unsavedChangesDialog,
            recentPaths,
            setOpenFileError,
            backupPaths,
            setOpenExportDialog,
            setExportSheetId,
            setReload,
            setOpenUpdater,
            setOpenReleaseNotes,
            setVersionInfo
          ) as any
        }
        theme={{
          bar: {
            color: theme.palette.text.primary,
            background: theme.palette.background.paper,
            borderBottom: 'none',
            icon: {
              width: 35,
              height: 35,
            },
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
