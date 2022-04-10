/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  Typography,
  Card,
  Grid,
  Checkbox,
  useTheme,
  Tooltip,
} from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import Rating from '../../model/Rating';
import { ratingsUpdateOne } from '../../slices/RatingSlice';
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
  const theme = useTheme();

  function onChangeChoiceValue(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch(
      ratingsUpdateOne({
        id: rating.id,
        changes: {
          value: event.target.checked ? task.answer.value : 0,
          autoCorrected: undefined,
        },
      })
    );
  }

  const successColor =
    theme.palette.type === 'dark'
      ? theme.palette.success.dark
      : theme.palette.success.light;

  const card = (
    <Card
      style={{
        padding: '0px 15px 0px 15px',
        margin: '0px',
        marginRight: '-1px',
        borderTopRightRadius: '0px',
        borderBottomRightRadius: '0px',
        background: rating.autoCorrected ? successColor : '',
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
                color="default"
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
  );

  return (
    <Box width="100%">
      {rating.autoCorrected ? (
        <Tooltip title="Automatically corrected">{card}</Tooltip>
      ) : (
        card
      )}
    </Box>
  );
}

export default SingleChoiceTaskView;
