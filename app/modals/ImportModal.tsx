/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CheckIcon from '@material-ui/icons/Check';
import { CloseIcon } from '@material-ui/data-grid';
import {
  Button,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { normalize } from 'normalizr';
import { ModalProps, useModal } from './ModalProvider';
import * as ImportIPC from '../constants/ImportIPC';
import { ImportConflicts, ImportProgress } from '../importer';
import Correction from '../model/Correction';
import {
  selectWorkspacePath,
  workspaceSetPath,
} from '../features/workspace/workspaceSlice';
import { CorrectionsSchema } from '../model/NormalizationSchema';
import { loadCorrections } from '../model/CorrectionsSlice';
import CircularProgressWithLabel from '../components/CircularProgressWithLabel';
import { ParserType } from '../parser/Parser';
// eslint-disable-next-line import/no-cycle
import OverwriteDuplicateSubmissionsDialog from '../dialogs/OverwriteDuplicateSubmissionsDialog';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import { save } from '../utils/FileAccess';
import { selectSettingsGeneral } from '../model/SettingsSlice';

type ImportModalProps = ModalProps & {
  path?: string;
  conflicts?: ImportConflicts;
};

enum ImportState {
  IMPORT_STARTED,
  IMPORT_SUCCESSFUL,
  IMPORT_FAILED,
}

const ImportModal: FC<ImportModalProps> = ({ ...props }) => {
  const { close, path, conflicts } = props;

  const dispatch = useDispatch();
  const showModal = useModal();
  const theme = useTheme();
  const { autosave } = useSelector(selectSettingsGeneral);
  const workspace = useSelector(selectWorkspacePath);
  const [importState, setImportState] = useState<ImportState>(
    ImportState.IMPORT_STARTED
  );
  const [importError, setImportError] = useState<Error | undefined>();
  const [importProgress, setImportProgress] = useState<
    ImportProgress | undefined
  >();

  useEffect(() => {
    const handleImportSuccessful = (
      _event: IpcRendererEvent,
      result: {
        corrections: Correction[];
        conflicts: ImportConflicts | undefined;
        newWorkspace: string | undefined;
      }
    ) => {
      setImportState(ImportState.IMPORT_SUCCESSFUL);
      // Update workspace
      if (result.newWorkspace) {
        dispatch(workspaceSetPath(result.newWorkspace));
      }

      // Load corrections
      if (result.corrections.length > 0) {
        const { entities } = normalize(result.corrections, CorrectionsSchema);
        dispatch(loadCorrections(entities));
        if (autosave) {
          dispatch(save());
        }
      }
      // Handle conflicts
      if (result.conflicts) {
        showModal(
          ConfirmationDialog,
          OverwriteDuplicateSubmissionsDialog(showModal, result.conflicts)
        );
      }
    };

    const handleImportFailed = (_event: IpcRendererEvent, error: Error) => {
      setImportError(error);
      setImportState(ImportState.IMPORT_FAILED);
    };
    const handleProgress = (
      _event: IpcRendererEvent,
      progress: ImportProgress
    ) => {
      setImportProgress(progress);
    };

    ipcRenderer.on(ImportIPC.IMPORT_SUCCESSFUL, handleImportSuccessful);
    ipcRenderer.on(ImportIPC.IMPORT_FAILED, handleImportFailed);
    ipcRenderer.on(ImportIPC.IMPORT_PROGRESS, handleProgress);
    if (path) {
      ipcRenderer.send(ImportIPC.IMPORT_START, {
        path,
        workspace,
        parserType: ParserType.Uni2Work,
      });
    } else if (conflicts) {
      ipcRenderer.send(ImportIPC.IMPORT_CONFLICTS, {
        workspace,
        conflicts,
      });
    }

    return () => {
      ipcRenderer.removeListener(
        ImportIPC.IMPORT_SUCCESSFUL,
        handleImportSuccessful
      );
      ipcRenderer.removeListener(ImportIPC.IMPORT_FAILED, handleImportFailed);
      ipcRenderer.removeListener(ImportIPC.IMPORT_PROGRESS, handleProgress);
    };
  }, []);

  let content;

  switch (importState) {
    case ImportState.IMPORT_STARTED:
      content = (
        <Dialog {...props}>
          <DialogContent style={{ padding: '20px', minWidth: '270px' }}>
            <Grid
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
              style={{ height: '100%' }}
            >
              {importProgress ? (
                <>
                  <Grid item>
                    <CircularProgressWithLabel
                      value={
                        ((importProgress.index + 1) / importProgress.total) *
                        100
                      }
                      size={30}
                    />
                  </Grid>
                  <Grid item>
                    <Typography gutterBottom>
                      <b>Importing file:</b>
                    </Typography>
                  </Grid>
                  <Grid item style={{ marginTop: '-15px' }}>
                    <Typography gutterBottom>
                      {importProgress.name.replace(/(.{20})..+/, '$1…')}
                    </Typography>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item>
                    <CircularProgress size={30} />
                  </Grid>
                  <Grid item>
                    <Typography gutterBottom>Initializing import...</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
        </Dialog>
      );
      break;
    case ImportState.IMPORT_SUCCESSFUL:
      content = (
        <Dialog {...props}>
          <DialogContent style={{ padding: '20px' }}>
            <Grid
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
              style={{ height: '100%', marginTop: '5px' }}
            >
              <Grid item>
                <CheckIcon
                  style={{
                    background:
                      theme.palette.type === 'dark'
                        ? theme.palette.success.dark
                        : theme.palette.success.light,
                    width: '30px',
                    height: '30px',
                    padding: '5px',
                    borderRadius: '50%',
                  }}
                />
              </Grid>
              <Grid item>
                <Typography gutterBottom>Import was successful!</Typography>
              </Grid>
              <Grid item style={{ marginBottom: '-5px' }}>
                <Button onClick={close} variant="outlined">
                  CLOSE
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      );
      break;
    default:
      content = (
        <Dialog {...props}>
          <DialogContent style={{ padding: '20px' }}>
            <Grid
              item
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={2}
              style={{ height: '100%' }}
            >
              <Grid item>
                <CloseIcon
                  style={{
                    background:
                      theme.palette.type === 'dark'
                        ? theme.palette.error.dark
                        : theme.palette.error.light,
                    width: '30px',
                    height: '30px',
                    padding: '5px',
                    borderRadius: '50%',
                  }}
                />
              </Grid>
              <Grid item>
                <Typography gutterBottom>
                  <b>{`${importError?.name}: `}</b>
                  {importError?.message}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    setImportState(ImportState.IMPORT_STARTED);
                    if (path) {
                      ipcRenderer.send(ImportIPC.IMPORT_START, {
                        path,
                        workspace,
                        parserType: ParserType.Uni2Work,
                      });
                    } else if (conflicts) {
                      ipcRenderer.send(ImportIPC.IMPORT_START, {
                        workspace,
                        conflicts,
                      });
                    }
                  }}
                  variant="outlined"
                >
                  Try again
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      );
  }

  return content;
};

export default ImportModal;
