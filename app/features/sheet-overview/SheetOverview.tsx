import { Box, Button, Grid, IconButton, Typography } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import React, { useEffect, useState } from 'react';
import {
  createSubmissionFileStruture,
  getAllFilesInDirectory,
  getAllRatingFiles,
  getAllSubmissionDirectories,
  getSubmissionDir,
  getSubmissionFromAppDataDir,
  getUniqueSheets,
  openDirectory,
} from '../../utils/FileAccess';
import SheetCardList from './SheetCardList';

export default function SheetOverview(props: any) {
  const { sheets, reload, setSchemaSheet, setSheetToCorrect, setTab } = props;

  async function onImportSubmissions() {
    const path: string = await openDirectory();
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    const subs: any[] = [];
    submissionDirectories.forEach((dir, i) => {
      const temp = createSubmissionFileStruture(dir);
      temp.id = i;
      subs.push(temp);
    });
    reload();
  }

  function onReload() {
    reload();
  }

  function test() {
    /*
    const correction = {
      status: 'DONE',
      corrector: {
        name: 'Michael Kölle',
        location: null,
      },
      submission: {
        name: 'uvswasdesdf',
        filePaths: ['C://Michael Desktop', 'C://Michael Desktop2'],
      },
      rating: {
        value: 12,
        comment: {
          text: 'EIn kommentar',
        }
      }
    };
    */
    // console.log(submissions);
  }

  return (
    <div
      style={{
        height: 'calc(100% - 45px)', // 29px TitleBar + 16px Margin
        display: 'flex',
        flexDirection: 'column',
        marginTop: '16px',
      }}
    >
      <Box>
        <Grid
          container
          justify="center"
          direction="column"
          alignItems="center"
          spacing={4}
        >
          <Grid item xs={12}>
            <Typography variant="h1">Welcome!</Typography>
          </Grid>
          <Grid
            item
            container
            xs={12}
            justify="center"
            direction="row"
            alignItems="center"
            spacing={4}
          >
            <Grid item>
              <Button color="primary" onClick={onImportSubmissions}>
                Import submissions
              </Button>
            </Grid>
            <Grid item>
              <IconButton onClick={onReload} size="small">
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box flex="1 1 0%" display="flex" flexDirection="column" marginTop="8px">
        <SheetCardList
          sheets={sheets}
          setSheetToCorrect={setSheetToCorrect}
          setSchemaSheet={setSchemaSheet}
          setTab={setTab}
          reload={reload}
        />
      </Box>
    </div>
  );
}
