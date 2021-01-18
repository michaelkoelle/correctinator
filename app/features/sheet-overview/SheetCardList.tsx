import { Box, List, ListItem, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { getSubmissionsOfSheet } from '../../utils/FileAccess';
import SheetCard from './SheetCard';

export default function SheetCardList(props: any) {
  const { sheets, setSheetToCorrect, setSchemaSheet, setTab, reload } = props;
  const workspacePath = useSelector((state: any) => state.workspace.path);

  if (sheets?.length > 0) {
    return (
      <List
        style={{
          flex: '1 1 0px',
          overflow: 'auto',
        }}
      >
        {sheets.map((sheet) => {
          return (
            <SheetCard
              key={
                sheet.term +
                sheet.school +
                sheet.course +
                sheet.sheet.name +
                sheet.rated_by
              }
              sheet={sheet}
              submissions={getSubmissionsOfSheet(sheet, workspacePath)}
              setSheetToCorrect={setSheetToCorrect}
              setSchemaSheet={setSchemaSheet}
              setTab={setTab}
              reload={reload}
            />
          );
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
