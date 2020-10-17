import { Box, Button, Grid, Typography } from '@material-ui/core';
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
  const { setCorrections, setSchemaSheet, setTab } = props;
  const [sheets, setSheets] = useState([]) as any;

  function loadSubmissions() {
    const path = getSubmissionDir();
    const subs: any[] = [];
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    submissionDirectories.forEach((dir, i) => {
      const temp = getSubmissionFromAppDataDir(dir);
      temp.id = i;
      subs.push(temp);
    });
    const tempSheets = getUniqueSheets(subs);
    setSheets(tempSheets);
  }

  async function onImportSubmissions() {
    const path: string = await openDirectory();
    const submissionDirectories: string[] = getAllSubmissionDirectories(path);
    const subs: any[] = [];
    submissionDirectories.forEach((dir, i) => {
      const temp = createSubmissionFileStruture(dir);
      temp.id = i;
      subs.push(temp);
    });
    loadSubmissions();
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

  useEffect(() => loadSubmissions(), []);

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
          <Grid item xs={12}>
            <Button color="primary" onClick={onImportSubmissions}>
              Import submissions
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box flex="1 1 0%" display="flex" flexDirection="column" marginTop="8px">
        <SheetCardList
          sheets={sheets}
          setCorrections={setCorrections}
          setSchemaSheet={setSchemaSheet}
          setTab={setTab}
        />
      </Box>
    </div>
  );
}
