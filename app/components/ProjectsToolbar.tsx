import { Button, Grid, InputAdornment, TextField } from '@material-ui/core';
import React from 'react';
import SearchIcon from '@material-ui/icons/Search';
import { SaveDialogReturnValue, remote, OpenDialogReturnValue } from 'electron';
import { useDispatch } from 'react-redux';
import * as Path from 'path';
import { createNewCorFile } from '../utils/FileAccess';
import { projectsAddOne } from '../model/ProjectsSlice';
import UUID from '../utils/UUID';

type ProjectsToolbarProps = {
  setSearchTerm: (search: string | undefined) => void;
};

export default function ProjectsToolbar(props: ProjectsToolbarProps) {
  const { setSearchTerm } = props;
  const dispatch = useDispatch();

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
    // TODO:
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
    // TODO: Open project
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
          id="filled-search"
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
          New File
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenFile()}
          style={{ marginTop: '10px', marginRight: '8px' }}
        >
          Open File
        </Button>
      </Grid>
    </Grid>
  );
}
