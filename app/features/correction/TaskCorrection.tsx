/* eslint-disable import/no-cycle */
/* eslint-disable react/jsx-no-duplicate-props */
import {
  Box,
  Card,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core';
import React from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import styles from './TaskCorrection.css';
import TaskCorrectionList from './TaskCorrectionList';
import { sumParam } from '../../utils/FileAccess';

export default function TaskCorrection(props: any) {
  const { correction, task, corrections, setTask, setTasks } = props;
  const [expanded, setExpanded] = React.useState(true);

  function getCommentsForTask(tsk, subs, comments: string[] = []) {
    subs?.forEach((t) => {
      if (t?.id === tsk?.id && t?.comment?.trim().length > 0) {
        comments.push(t.comment);
      } else if (t?.tasks?.length > 0) {
        getCommentsForTask(tsk, t?.tasks, comments);
      }
    });
    return comments;
  }

  const handleClick = () => {
    setExpanded(!expanded);
  };

  function onChangeComment(event, value, reason) {
    const temp = { ...task };
    temp.comment = value;
    setTask([temp]);
  }

  function handleChange(e: any) {
    const temp = { ...task };
    const { name, value } = e.target;
    temp[name] = value;

    // Make sure that value <= max
    if (name === 'max' || name === 'value') {
      temp.value = Math.min(temp.value, temp.max);
    }

    setTask([temp]);
  }

  if (task.tasks.length > 0) {
    const sumMax = sumParam(task.tasks, 'max');
    const sumValue = sumParam(task.tasks, 'value');

    return (
      <Box width="100%">
        <Card
          style={{
            padding: '15px',
            paddingRight: '0px',
            margin: '0px',
            marginRight: '-1px',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
          }}
          variant="outlined"
        >
          <Grid
            container
            spacing={2}
            alignItems="center"
            justify="space-between"
          >
            <Grid item>
              <Typography>{task.name}</Typography>
            </Grid>
            <Grid item>
              <Grid
                container
                spacing={2}
                alignItems="center"
                justify="space-between"
              >
                <Grid item>
                  <Typography>{sumValue}</Typography>
                </Grid>
                <Grid item>
                  <Typography>/</Typography>
                </Grid>
                <Grid item>
                  <Typography>{sumMax}</Typography>
                </Grid>
                <Grid item>
                  <Typography>{correction.sheet.grading.type}</Typography>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={handleClick}
                    aria-label="show more"
                    size="small"
                  >
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <TaskCorrectionList
              correction={correction}
              submissions={corrections}
              setTaskParent={setTask}
              tasks={task?.tasks}
              setTasks={setTasks}
              disableGutters
            />
          </Collapse>
        </Card>
      </Box>
    );
  }

  return (
    <Box width="100%">
      <Card
        style={{
          padding: '15px',
          margin: '0px',
          marginRight: '-1px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
        variant="outlined"
      >
        <Grid container spacing={2} alignItems="center" justify="space-between">
          <Grid item>
            <Typography>{task.name}</Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justify="space-between"
            >
              <Grid item>
                <Box width="5em">
                  <TextField
                    id="value"
                    name="value"
                    type="number"
                    value={task.value}
                    inputProps={{ min: 0, max: task.max, step: task.step }}
                    onChange={handleChange}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item>
                <Typography>/</Typography>
              </Grid>
              <Grid item>
                <Typography>{task.max}</Typography>
              </Grid>
              <Grid item>
                <Typography>{correction.sheet.grading.type}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              id="combo-box-demo"
              options={[...new Set(getCommentsForTask(task, corrections))]}
              freeSolo
              value={task.comment}
              onChange={onChangeComment}
              renderInput={(params) => (
                <TextField
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...params}
                  id="comment"
                  label="Comment"
                  multiline
                  name="comment"
                  // value={task.comment}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
