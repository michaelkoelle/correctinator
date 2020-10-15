import {
  Button,
  Card,
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
  getUniqueSheets,
} from '../../utils/FileAccess';

export default function SheetOverview(props: any) {
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
    console.log(submissions);
  }

  function getStatusScheme(sheet, subs) {
    const sheetSubs = subs.filter(
      (s) =>
        s.term === sheet.term &&
        s.school === sheet.school &&
        s.course === sheet.course &&
        s.sheet.name === sheet.sheet.name &&
        s.rated_by === sheet.rated_by
    );

    return `[${sheetSubs.filter((s) => s.tasks?.length > 0).length}/${
      sheetSubs.length
    }] Correction scheme assigned`;
  }

  function getStatusCorrection(sheet, subs) {
    const sheetSubs = subs.filter(
      (s) =>
        s.term === sheet.term &&
        s.school === sheet.school &&
        s.course === sheet.course &&
        s.sheet.name === sheet.sheet.name &&
        s.rated_by === sheet.rated_by
    );

    return `[${sheetSubs.filter((s) => s.rating_done === true).length}/${
      sheetSubs.length
    }] Correction done`;
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
              <ListItem
                key={
                  sheet.term +
                  sheet.school +
                  sheet.course +
                  sheet.sheet.name +
                  sheet.rated_by
                }
              >
                <Card>
                  <CardHeader
                    // eslint-disable-next-line prettier/prettier
                    action={(
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                      // eslint-disable-next-line prettier/prettier
                    )}
                    subheader={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <>
                        <div>{`${sheet.school} - ${sheet.course} ${sheet.term} - ${sheet.rated_by}`}</div>
                      </>
                    }
                    title={sheet.sheet.name}
                  />
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      {getStatusScheme(sheet, submissions)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      {getStatusCorrection(sheet, submissions)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button>Start correction</Button>
                  </CardActions>
                </Card>
              </ListItem>
            );
          })}
        </List>
      </Grid>
    </Grid>
  );
}
