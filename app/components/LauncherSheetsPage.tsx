import { Box, Divider, Typography, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SheetCardList from '../features/sheet-overview/SheetCardList';
import SheetEntity from '../model/SheetEntity';
import { selectAllSheets } from '../model/SheetSlice';
import SheetsToolbar from './SheetToolbar';

export default function LauncherSheetsPage() {
  const theme = useTheme();
  const allSheets: SheetEntity[] = useSelector(selectAllSheets);
  const [searchTerm, setSearchTerm] = useState<string | undefined>();

  const sheets: SheetEntity[] = allSheets.filter((s) =>
    searchTerm ? s.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div
      style={{
        height: 'calc(100% - 45px)', // 29px TitleBar + 16px Margin
        display: 'flex',
        flexDirection: 'column',
        marginTop: '8px',
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
              marginTop: '24px',
              color: theme.palette.text.disabled,
            }}
          >
            No submissions imported yet!
          </Typography>
          <Typography
            style={{
              width: '100%',
              textAlign: 'center',
              color: theme.palette.text.disabled,
            }}
          >
            You can import submissions with the buttons above!
          </Typography>
        </>
      )}
      {searchTerm && sheets.length === 0 && (
        <Typography
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: '24px',
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
