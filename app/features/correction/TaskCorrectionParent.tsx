/* eslint-disable import/no-cycle */
import {
  Box,
  Typography,
  Card,
  Grid,
  IconButton,
  Collapse,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import React, { useMemo } from 'react';
import { sumParam } from '../../utils/FileAccess';
import TaskCorrectionList from './TaskCorrectionList';

function TaskCorrectionParent(props: any) {
  const { task, type, acOptionsArray, setTasks, setTaskParent } = props;
  const [expanded, setExpanded] = React.useState(true);
  const sumMax = sumParam(task.tasks, 'max');
  const sumValue = sumParam(task.tasks, 'value');

  const onExpand = () => {
    setExpanded(!expanded);
  };

  console.log(`render: ${task.name}`);

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
                <Typography>{sumValue}</Typography>
              </Grid>
              <Grid item>
                <Typography>/</Typography>
              </Grid>
              <Grid item>
                <Typography>{sumMax}</Typography>
              </Grid>
              <Grid item>
                <Typography>{type}</Typography>
              </Grid>
              <Grid item>
                <IconButton
                  onClick={onExpand}
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
            type={type}
            acOptionsArray={acOptionsArray}
            tasks={task?.tasks}
            setTaskParent={setTaskParent}
            setTasks={setTasks}
            disableGutters
          />
        </Collapse>
      </Card>
    </Box>
  );
}

export default React.memo(TaskCorrectionParent);
