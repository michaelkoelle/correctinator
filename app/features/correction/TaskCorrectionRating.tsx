/* eslint-disable react/jsx-props-no-spreading */
import { Box, TextField, Typography, Card, Grid } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import TaskCommentInput from './TaskCommentInput';

function TaskCorrectionRating(props: any) {
  const { task, type, acOptions = [], handleChange, onChangeComment } = props;

  console.log(`render: ${task.name}`);
  /*
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
              <Grid item>
                <Tooltip title="Full points">
                  <span>
                    <IconButton
                      onClick={() => setFullPoints(task)}
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
                      onClick={() => setSolutionMissing(task)}
                      size="small"
                    >
                      <HighlightOff />
                    </IconButton>
                  </span>
                </Tooltip>
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
  */
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
                <Typography>{type}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TaskCommentInput
              comment={task.comment}
              acOptions={acOptions}
              handleChange={handleChange}
              onChangeComment
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default React.memo(TaskCorrectionRating);
