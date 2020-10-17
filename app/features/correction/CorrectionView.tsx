import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { saveSubmissions } from '../../utils/FileAccess';
import CorrectionOverview from './CorrectionOverview';
import TaskCorrectionList from './TaskCorrectionList';
import TaskView from './TaskView';

export default function CorrectionView(props: any) {
  const { submission = {}, submissions = [], index, setIndex } = props;
  //  const [index, setIndex] = useState(0);
  const [subs, setSubs] = useState(submissions);

  function sumParam(tasks: any, param: string): any {
    let sum = 0;
    tasks?.forEach((t: any) => {
      if (t.tasks.length > 0) {
        sum += Number.parseFloat(sumParam(t.tasks, param));
      } else {
        sum += Number.parseFloat(t[param]);
      }
    });
    return sum;
  }

  function setTasks(tasks: any) {
    const temps = [...subs];
    temps[index].tasks = tasks;
    temps[index].points = sumParam(tasks, 'value');
    setSubs(temps);
    saveSubmissions(temps);
  }

  function onAddNote() {
    // TODO
  }

  function onCorrectionDone() {
    // Rating done
    const temps = [...subs];
    temps[index].rating_done = true;
    setSubs(temps);
    saveSubmissions(temps);
    // TODO: save and update submission
    if (index + 1 < subs.length) {
      setIndex(index + 1);
    } else {
      // TODO:
      // Check if really finished
      // Prompt to export and create zip
    }
  }

  function onPrevious() {
    // TODO: save and update submission
    if (index > 0) {
      setIndex(index - 1);
    } else {
      // TODO:
      // Reached the first one
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={3} justify="space-evenly" alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h3">CorrectionView</Typography>
        </Grid>
        <Grid item xs={12}>
          <CorrectionOverview submission={subs[index]} />
        </Grid>
        <Grid item xs={12} />
      </Grid>
      <TaskView tasks={subs[index]?.tasks} setTasks={setTasks} />
      <Grid
        container
        spacing={3}
        justify="flex-end"
        alignItems="center"
        style={{ padding: '10px' }}
      >
        <Grid item>
          <Button color="secondary" onClick={onAddNote}>
            Add Note
          </Button>
        </Grid>
        <Grid item>
          <Button color="primary" onClick={onPrevious}>
            Previous
          </Button>
        </Grid>
        <Grid item>
          <Button color="primary" onClick={onCorrectionDone}>
            Mark as done and save
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
