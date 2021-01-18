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
  /*
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
                  <Tooltip title="Full points">
                    <span>
                      <IconButton
                        onClick={() => setFullPointsAllTasks(task)}
                        size="small"
                      >
                        <CheckCircleOutline />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
                <Grid item style={{ marginLeft: '-15px' }}>
                  <Tooltip title="Missing Solution">
                    <span>
                      <IconButton
                        onClick={() => setSolutionMissingAllTasks(task)}
                        size="small"
                      >
                        <HighlightOff />
                      </IconButton>
                    </span>
                  </Tooltip>
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
              corrections={corrections}
              setTaskParent={setTask}
              tasks={task?.tasks}
              setTasks={setTasks}
              disableGutters
            />
          </Collapse>
        </Card>
      </Box>
*/
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
