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
  LinearProgress,
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

export default function SheetCard(props: any) {
  const { sheet, submissions, setCorrections, setSchemaSheet, setTab } = props;

  function onStartCorrection() {
    setCorrections(submissions);
    setTab(3);
    // TODO: Switch to Corrections Tab
  }

  function onCreateSchema() {
    setSchemaSheet(sheet);
    setTab(2);
    // TODO: Switch to Schema Generator Tab
  }

  function missingSchemas() {
    return (
      submissions.filter(
        (s) => s?.tasks === undefined || s?.tasks?.length === 0
      ).length > 0
    );
  }

  return (
    <ListItem>
      <Card>
        <CardHeader
          // eslint-disable-next-line prettier/prettier
          action={(
            <IconButton>
              <MoreVertIcon />
            </IconButton>
            // eslint-disable-next-line prettier/prettier
                    )}
          // eslint-disable-next-line prettier/prettier
          subheader={(
            <>
              <div>{`${sheet.school} - ${sheet.course} ${sheet.term} - ${sheet.rated_by}`}</div>
            </>
            // eslint-disable-next-line prettier/prettier
                    )}
          title={sheet.sheet.name}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {`[${submissions.filter((s) => s.tasks?.length > 0).length}/${
              submissions.length
            }] Correction scheme assigned`}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {`[${submissions.filter((s) => s.rating_done === true).length}/${
              submissions.length
            }] Correction done`}
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={onCreateSchema} disabled={!missingSchemas()}>
            Create schema
          </Button>
          <Button onClick={onStartCorrection} disabled={missingSchemas()}>
            Start correction
          </Button>
        </CardActions>
        <LinearProgress
          variant="determinate"
          value={
            (submissions.filter((s) => s.rating_done === true).length /
              submissions.length) *
            100
          }
        />
      </Card>
    </ListItem>
  );
}
