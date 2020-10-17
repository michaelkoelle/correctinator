import { Box, List, ListItem, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { getSubmissionsOfSheet } from '../../utils/FileAccess';
import SheetCard from './SheetCard';

export default function SheetCardList(props: any) {
  const { sheets, setCorrections, setSchemaSheet, setTab } = props;
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
              submissions={getSubmissionsOfSheet(sheet)}
              setCorrections={setCorrections}
              setSchemaSheet={setSchemaSheet}
              setTab={setTab}
            />
          );
        })}
      </List>
    );
  }
  return (
    <List>
      <ListItem>
        <Paper variant="outlined">
          <Box m={2}>
            <Typography>No submissions imported yet!</Typography>
          </Box>
        </Paper>
      </ListItem>
    </List>
  );
}
