/* eslint react/jsx-props-no-spreading: off */
import React, { useEffect, useRef, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { ipcRenderer, remote } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { UpdateInfo } from 'electron-updater';
import * as Path from 'path';
import routes from './constants/routes.json';
import App from './containers/App';
import SchemeGeneratorPage from './containers/SchemeGeneratorPage';
import OverviewPage from './containers/OverviewPage';
import CorrectionViewPage from './containers/CorrectionViewPage';
import SheetOverviewPage from './containers/SheetOverviewPage';
import NewHomePage from './containers/NewHomePage';
import FramelessTitleBar from './containers/FramelessTitleBar';
import { reloadState, save } from './utils/FileAccess';
import { selectUnsavedChanges } from './model/SaveSlice';
import UpdaterDialog from './components/UpdaterDialog';
import {
  CHECK_FOR_UPDATE_PENDING,
  CHECK_FOR_UPDATE_SUCCESS,
  RECEIVE_FILE_PATH,
  REQUEST_FILE_PATH,
} from './constants/ipc';
import { version as currentAppVersion } from '../package.json';
import {
  selectWorkspacePath,
  workspaceSetPath,
} from './features/workspace/workspaceSlice';
import { selectSettingsBackup } from './model/SettingsSlice';
import { BACKUP_START, BACKUP_STOP } from './constants/BackupIPC';
import { useModal } from './dialogs/ModalProvider';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import UnsavedChangesDialog from './dialogs/UnsavedChangesDialog';

export default function Routes() {
  const dispatch = useDispatch();
  const showModal = useRef(useModal());
  const unsavedChanges = useSelector(selectUnsavedChanges);
  const saveBackups = useSelector(selectSettingsBackup);
  const workspacePath = useSelector(selectWorkspacePath);
  const [openUpdaterDialog, setOpenUpdaterDialog] = useState<boolean>(false);
  const [showNotAvailiable, setShowNotAvailiable] = useState<boolean>(false);
  const [quitAnyways, setQuitAnyways] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  function updaterDialog(show: boolean) {
    setShowNotAvailiable(show);
    setOpenUpdaterDialog(true);
  }

  useEffect(() => {
    ipcRenderer.on(RECEIVE_FILE_PATH, (_event, path: string) => {
      if (Path.extname(path) === '.cor') {
        if (unsavedChanges) {
          showModal.current(ConfirmationDialog, UnsavedChangesDialog(path));
        } else {
          dispatch(workspaceSetPath(path));
          dispatch(reloadState());
        }
      }
    });

    return () => {
      ipcRenderer.removeAllListeners(RECEIVE_FILE_PATH);
    };
  }, [dispatch, showModal, unsavedChanges]);

  useEffect(() => {
    ipcRenderer.on(
      CHECK_FOR_UPDATE_SUCCESS,
      (_event, info: UpdateInfo | undefined) => {
        const version = info && info.version;
        if (version && version !== currentAppVersion) {
          // Show updater dialog
          updaterDialog(false);
        }
      }
    );

    // Check for updates at start
    ipcRenderer.send(CHECK_FOR_UPDATE_PENDING);
    // Get file path
    ipcRenderer.send(REQUEST_FILE_PATH);

    return () => {
      ipcRenderer.removeAllListeners(CHECK_FOR_UPDATE_SUCCESS);
    };
  }, []);

  useEffect(() => {
    // Start Backup
    if (workspacePath.length > 0 && saveBackups) {
      ipcRenderer.send(BACKUP_START, workspacePath);
    }

    return () => {
      // Stop Backup
      ipcRenderer.send(BACKUP_STOP);
    };
  }, [saveBackups, workspacePath]);

  useEffect(() => {
    const beforeQuit = (e: BeforeUnloadEvent) => {
      if (reload) {
        setReload(false);
      } else if (unsavedChanges && !quitAnyways) {
        e.returnValue = false;
        e.preventDefault();
        showModal.current(ConfirmationDialog, {
          title: 'Save before quitting?',
          text: 'Do you want to save your changes before quitting?',
          onConfirm: () => {
            dispatch(save());
            setQuitAnyways(false);
            remote.getCurrentWindow().close();
          },
          onReject: () => {
            setQuitAnyways(true);
            remote.getCurrentWindow().close();
          },
          onCancel: () => {
            setQuitAnyways(false);
          },
        });
      }
    };
    window.addEventListener('beforeunload', beforeQuit, true);
    return () => {
      window.removeEventListener('beforeunload', beforeQuit, true);
    };
  }, [dispatch, quitAnyways, reload, showModal, unsavedChanges]);

  return (
    <App>
      <FramelessTitleBar setOpenUpdater={updaterDialog} setReload={setReload} />
      <Switch>
        <Route path={routes.SHEETOVERVIEW} component={SheetOverviewPage} />
        <Route path={routes.CORRECTIONVIEW} component={CorrectionViewPage} />
        <Route path={routes.OVERVIEW} component={OverviewPage} />
        <Route path={routes.SCHEMAGENERATOR} component={SchemeGeneratorPage} />
        <Route path={routes.HOME} component={NewHomePage} />
      </Switch>
      <UpdaterDialog
        open={openUpdaterDialog}
        setOpen={setOpenUpdaterDialog}
        showNotAvailiable={showNotAvailiable}
      />
    </App>
  );
}
