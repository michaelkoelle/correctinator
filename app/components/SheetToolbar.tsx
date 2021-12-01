import { Button, Grid, InputAdornment, TextField } from '@material-ui/core';
import React from 'react';
import SearchIcon from '@material-ui/icons/Search';
import { remote } from 'electron';
import { openDirectory } from '../utils/FileAccess';
import ImportModal from '../modals/ImportModal';
import { useModal } from '../modals/ModalProvider';

type SheetsToolbarProps = {
  setSearchTerm: (search: string | undefined) => void;
};

export default function SheetsToolbar(props: SheetsToolbarProps) {
  const { setSearchTerm } = props;
  const showModal = useModal();

  async function onImportSubmissionsFolder() {
    const path: string = await openDirectory();
    if (path) {
      showModal(ImportModal, { path });
    }
  }

  async function onImportSubmissionsZip() {
    const dialogReturnValue = await remote.dialog.showOpenDialog({
      filters: [{ name: 'Zip', extensions: ['zip'] }],
      properties: ['openFile'],
    });
    const path = dialogReturnValue.filePaths[0];
    if (path) {
      showModal(ImportModal, { path });
    }
  }

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
          placeholder="Search sheets"
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
          onClick={() => onImportSubmissionsFolder()}
          style={{ marginTop: '10px' }}
        >
          Import Folder
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onImportSubmissionsZip()}
          style={{ marginTop: '10px', marginRight: '8px' }}
        >
          Import ZIP
        </Button>
      </Grid>
    </Grid>
  );
}
