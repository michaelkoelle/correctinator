import {
  Box,
  Button,
  Divider,
  Grid,
  Typography,
  useTheme,
} from '@material-ui/core';
import React, { useState } from 'react';
import { remote } from 'electron';
import { useSelector } from 'react-redux';
import { openDirectory } from '../../utils/FileAccess';
import SheetCardList from './SheetCardList';
import { useModal } from '../../modals/ModalProvider';
import ImportModal from '../../modals/ImportModal';
import SheetsToolbar from '../../components/SheetToolbar';
import { selectAllSheets } from '../../slices/SheetSlice';
import SheetEntity from '../../model/SheetEntity';

export default function SheetOverview() {
  const theme = useTheme();
  const allSheets: SheetEntity[] = useSelector(selectAllSheets);
  const [searchTerm, setSearchTerm] = useState<string | undefined>();

  const sheets: SheetEntity[] = allSheets.filter((s) =>
    searchTerm ? s.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

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
    <div
      style={{
        height: 'calc(100% - 45px)', // 29px TitleBar + 16px Margin
        display: 'flex',
        flexDirection: 'column',
        // marginTop: '8px',
      }}
    >
      <SheetsToolbar setSearchTerm={setSearchTerm} />
      <Divider
        variant="middle"
        style={{
          margin: '16px 8px 8px 8px',
        }}
      />
      {!searchTerm && sheets.length === 0 && (
        <>
          <Typography
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '16px',
              color: theme.palette.text.disabled,
            }}
          >
            No submissions imported yet! You can import submissions with the
            buttons below!
          </Typography>
          <Grid container justify="center" alignItems="center">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onImportSubmissionsFolder()}
                style={{ marginTop: '10px', marginRight: '8px' }}
              >
                Import from Folder
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onImportSubmissionsZip()}
                style={{ marginTop: '10px', marginRight: '8px' }}
              >
                Import from ZIP
              </Button>
            </Grid>
          </Grid>
        </>
      )}
      {searchTerm && sheets.length === 0 && (
        <Typography
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: '16px',
            color: theme.palette.text.disabled,
          }}
        >
          No matching sheets for your search term!
        </Typography>
      )}
      <Box flex="1 1 0%" display="flex" flexDirection="column" marginTop="8px">
        <SheetCardList sheets={sheets} />
      </Box>
    </div>
  );
}
