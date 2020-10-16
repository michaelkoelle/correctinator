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
import styles from './TaskCorrection.css';
import TaskCorrectionList from './TaskCorrectionList';

export default function TaskCorrection(props: any) {
  const { setTaskParent, task, setTask, setTasks } = props;
  const [expanded, setExpanded] = React.useState(true);

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

  const handleClick = () => {
    setExpanded(!expanded);
  };

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
                  <Typography>{task.type}</Typography>
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
                <Typography>{task.type}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="comment"
              label="Comment"
              multiline
              name="comment"
              value={task.comment}
              onChange={handleChange}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
