import { Button, Grid, InputAdornment, TextField } from '@material-ui/core';
import React from 'react';
import SearchIcon from '@material-ui/icons/Search';
import { SaveDialogReturnValue, remote, OpenDialogReturnValue } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import * as Path from 'path';
import { createNewCorFile, reloadState } from '../utils/FileAccess';
import { projectsAddOne } from '../slices/ProjectsSlice';
import UUID from '../utils/UUID';
import LauncherTabs from '../model/LauncherTabs';
import { launcherSetTabIndex } from '../slices/LauncherSlice';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import UnsavedChangesDialog from '../dialogs/UnsavedChangesDialog';
import { workspaceSetPath } from '../slices/WorkspaceSlice';
import { useModal } from '../modals/ModalProvider';
import { selectUnsavedChanges } from '../slices/SaveSlice';

type ProjectsToolbarProps = {
  setSearchTerm: (search: string | undefined) => void;
};

export default function ProjectsToolbar(props: ProjectsToolbarProps) {
  const { setSearchTerm } = props;
  const dispatch = useDispatch();
  const showModal = useModal();
  const unsavedChanges = useSelector(selectUnsavedChanges);

  const handleOpenFile = async () => {
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
    await dispatch(
      projectsAddOne({
        id: UUID.v5(path),
        name: Path.parse(path).name,
        path,
      })
    );
    if (unsavedChanges) {
      showModal(ConfirmationDialog, UnsavedChangesDialog(path));
    } else {
      dispatch(workspaceSetPath(path));
      dispatch(reloadState());
      dispatch(launcherSetTabIndex(LauncherTabs.SHEETS));
    }
  };

  const handleNewFile = async () => {
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
    await dispatch(
      projectsAddOne({
        id: UUID.v5(path),
        name: Path.parse(path).name,
        path,
      })
    );
    if (unsavedChanges) {
      showModal(ConfirmationDialog, UnsavedChangesDialog(path));
    } else {
      dispatch(workspaceSetPath(path));
      dispatch(reloadState());
      dispatch(launcherSetTabIndex(LauncherTabs.SHEETS));
    }
  };

  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid
        item
        style={{
          flex: '1 1 0%',
          marginTop: '15px',
        }}
      >
        <TextField
          placeholder="Search projects"
          type="search"
          size="small"
          variant="standard"
          style={{ marginLeft: '8px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          fullWidth
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleNewFile()}
          style={{ marginTop: '10px' }}
        >
          New Project
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenFile()}
          style={{ marginTop: '10px', marginRight: '8px' }}
        >
          Open
        </Button>
      </Grid>
    </Grid>
  );
}
