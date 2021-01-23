import { Box, List, ListItem, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import Sheet from '../../model/Sheet';
import { selectAllSheets } from '../../model/SheetSlice';
import SheetCard from './SheetCard';

export default function SheetCardList() {
  // const { sheets, setSheetToCorrect, setSchemaSheet, setTab, reload } = props;
  // const workspacePath = useSelector((state: any) => state.workspace.path);
  const sheets: Sheet[] = useSelector(selectAllSheets);

  if (sheets?.length > 0) {
    return (
      <List
        style={{
          flex: '1 1 0px',
          overflow: 'auto',
        }}
      >
        {sheets.map((sheet) => {
          return <SheetCard key={sheet.id} sheet={sheet} />;
        })}
      </List>
    );
  }
  return (
    <List
      style={{
        flex: '1 1 0px',
        overflow: 'auto',
      }}
    >
      <ListItem style={{ width: 'fit-content', margin: '0 auto' }}>
        <Paper variant="outlined">
          <Box m={2}>
            <Typography>No submissions imported yet!</Typography>
          </Box>
        </Paper>
      </ListItem>
    </List>
  );
}
