/* eslint react/jsx-props-no-spreading: off */
import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
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
import ConfirmDialog from './components/ConfirmDialog';
import {
  selectSettingsBackup,
  selectSettingsTheme,
} from './model/SettingsSlice';
import { shouldUseDarkColors, themeToPaletteType } from './model/Theme';
import { BACKUP_START, BACKUP_STOP } from './constants/BackupIPC';

const createTheme = (appTheme) =>
  createMuiTheme({
    palette: {
      type: themeToPaletteType(appTheme),
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          '*::-webkit-scrollbar': {
            width: '0.5em',
            height: '0.5em',
          },
          '*::-webkit-scrollbar-track': {
            '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: shouldUseDarkColors(appTheme)
              ? 'rgba(255,255,255,.2)'
              : 'rgba(0,0,0,.2)',
            outline: '1px solid slategrey',
            borderRadius: '5px',
          },
          '*::-webkit-scrollbar-corner': {
            opacity: 0,
          },
        },
      },
    },
  });

export default function Routes() {
  const dispatch = useDispatch();
  const unsavedChanges = useSelector(selectUnsavedChanges);
  const appTheme = useSelector(selectSettingsTheme);
  const saveBackups = useSelector(selectSettingsBackup);
  const workspacePath = useSelector(selectWorkspacePath);
  const [, setMuiTheme] = useState(createTheme(appTheme));
  const [openUpdaterDialog, setOpenUpdaterDialog] = useState<boolean>(false);
  const [showNotAvailiable, setShowNotAvailiable] = useState<boolean>(false);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
  const [openSaveDialogNewFile, setOpenSaveDialogNewFile] = useState<boolean>(
    false
  );
  const [openSaveDialogExit, setOpenSaveDialogExit] = useState<boolean>(false);
  const [quitAnyways, setQuitAnyways] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [newFilePath, setNewFilePath] = useState<string>('');

  function updaterDialog(show: boolean) {
    setShowNotAvailiable(show);
    setOpenUpdaterDialog(true);
  }

  function unsavedChangesDialog(path: string) {
    setNewFilePath(path);
    if (unsavedChanges) {
      setOpenSaveDialogNewFile(true);
    } else {
      dispatch(workspaceSetPath(path));
      dispatch(reloadState());
    }
  }

  useEffect(() => {
    ipcRenderer.on(RECEIVE_FILE_PATH, (_event, data: string) => {
      if (Path.extname(data) === '.cor') {
        setNewFilePath(data);
        if (unsavedChanges) {
          setOpenSaveDialogNewFile(true);
        } else {
          dispatch(workspaceSetPath(data));
          dispatch(reloadState());
        }
      }
    });

    return () => {
      ipcRenderer.removeAllListeners(RECEIVE_FILE_PATH);
    };
  }, [dispatch, unsavedChanges]);

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
        setOpenSaveDialogExit(true);
      }
    };
    window.addEventListener('beforeunload', beforeQuit, true);
    return () => {
      window.removeEventListener('beforeunload', beforeQuit, true);
    };
  }, [dispatch, quitAnyways, reload, unsavedChanges]);

  useEffect(() => {
    const setTheme = () => {
      // Does nothing but required for force reload
      setMuiTheme(createTheme(appTheme));
    };
    remote.nativeTheme.on('updated', setTheme);
    return () => {
      remote.nativeTheme.removeListener('updated', setTheme);
    };
  }, [appTheme]);

  return (
    <ThemeProvider theme={createTheme(appTheme)}>
      <CssBaseline />
      <App>
        <FramelessTitleBar
          setOpenUpdater={updaterDialog}
          unsavedChangesDialog={unsavedChangesDialog}
          setReload={setReload}
        />
        <Switch>
          <Route path={routes.SHEETOVERVIEW} component={SheetOverviewPage} />
          <Route path={routes.CORRECTIONVIEW} component={CorrectionViewPage} />
          <Route path={routes.OVERVIEW} component={OverviewPage} />
          <Route
            path={routes.SCHEMAGENERATOR}
            component={SchemeGeneratorPage}
          />
          <Route path={routes.HOME} component={NewHomePage} />
        </Switch>
        <UpdaterDialog
          open={openUpdaterDialog}
          setOpen={setOpenUpdaterDialog}
          showNotAvailiable={showNotAvailiable}
        />
        <ConfirmDialog
          open={openSaveDialog}
          setOpen={setOpenSaveDialog}
          title="Unsaved changes"
          text="Do you want to save your changes?"
          onConfirm={() => {
            dispatch(save());
            setOpenSaveDialog(false);
          }}
          onReject={() => setOpenSaveDialog(false)}
        />
        <ConfirmDialog
          open={openSaveDialogNewFile}
          setOpen={setOpenSaveDialogNewFile}
          title="Unsaved changes"
          text="Do you want to save your changes before loading the new file?"
          onConfirm={() => {
            dispatch(save());
            setOpenSaveDialogNewFile(false);
            dispatch(workspaceSetPath(newFilePath));
            dispatch(reloadState());
          }}
          onReject={() => {
            setOpenSaveDialogNewFile(false);
            dispatch(workspaceSetPath(newFilePath));
            dispatch(reloadState());
          }}
        />
        <ConfirmDialog
          open={openSaveDialogExit}
          setOpen={setOpenSaveDialogExit}
          title="Unsaved changes"
          text="Do you want to save your changes before quitting? Click reload to discard your changes."
          onConfirm={() => {
            dispatch(save());
            setQuitAnyways(false);
            remote.getCurrentWindow().close();
          }}
          onReject={() => {
            setQuitAnyways(true);
            remote.getCurrentWindow().close();
          }}
          onCancel={() => {
            setQuitAnyways(false);
          }}
        />
      </App>
    </ThemeProvider>
  );
}
