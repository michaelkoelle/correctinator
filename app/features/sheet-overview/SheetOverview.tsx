import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  GridList,
  GridListTile,
  IconButton,
  List,
  ListItem,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { normalize } from 'normalizr';
import routes from '../../constants/routes.json';
import {
  getAllSubmissionDirectories,
  getSubmissionDir,
  getSubmissionFromAppDataDir,
  getSubmissionsOfSheet,
  getUniqueSheets,
} from '../../utils/FileAccess';
import SheetCard from './SheetCard';

export default function SheetOverview(props: any) {
  const { setCorrections, setSchemaSheet, setTab } = props;
  const [submissions, setSubmissions] = useState([]) as any;
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
    setSubmissions(subs);
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
    <Grid container justify="center" direction="column" alignItems="center">
      <Grid container>
        <Link to={routes.HOME}>
          <ArrowBackIcon style={{ fill: 'black' }} />
        </Link>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h1">Welcome!</Typography>
      </Grid>
      <Grid item xs={12}>
        <Button color="primary" onClick={test}>
          Import submissions
        </Button>
      </Grid>
      <Grid item>
        <List>
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
      </Grid>
    </Grid>
  );
}
