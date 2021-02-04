/* eslint-disable react/jsx-props-no-spreading */
import { Box, Typography, Card, Grid, Checkbox } from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import Rating from '../../model/Rating';
import { ratingsUpdateOne } from '../../model/RatingSlice';
import SingleChoiceTask from '../../model/SingleChoiceTask';

type SingleChoiceTaskViewProps = {
  task: SingleChoiceTask;
  rating: Rating;
  type: string;
};

function SingleChoiceTaskView(props: SingleChoiceTaskViewProps) {
  const { task, type, rating } = props;
  const checked = false || rating.value > 0;
  const dispatch = useDispatch();

  function onChangeChoiceValue(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch(
      ratingsUpdateOne({
        id: rating.id,
        changes: {
          value: event.target.checked ? task.answer.value : 0,
        },
      })
    );
  }

  return (
    <Box width="100%">
      <Card
        style={{
          padding: '0px 15px 0px 15px',
          margin: '0px',
          marginRight: '-1px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
        variant="outlined"
      >
        <Grid container spacing={2} alignItems="center" justify="space-between">
          <Grid item>
            <Typography>
              {`${task.name}${task.delimiter ? task.delimiter : ':'}`}
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justify="space-between"
            >
              <Grid item>
                <Typography>{rating.value}</Typography>
              </Grid>
              <Grid item>
                <Typography>/</Typography>
              </Grid>
              <Grid item>
                <Typography>{task.answer.value}</Typography>
              </Grid>
              <Grid item>
                <Typography>{type}</Typography>
              </Grid>
              <Grid item style={{ marginLeft: '2em' }}>
                <Checkbox
                  title="Value"
                  checked={checked}
                  color="primary"
                  onChange={onChangeChoiceValue}
                />
              </Grid>
              <Grid item style={{ width: '2em' }}>
                <Typography>{task.answer.text}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default SingleChoiceTaskView;
