/* eslint-disable react/jsx-no-duplicate-props */
import React, { ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';
import { Collapse, IconButton, InputAdornment } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import styles from './TaskScheme.css';
import {
  schemaClearSelectedTask,
  schemaSetSelectedTask,
  schemaUpsertComment,
  schemaUpsertRating,
  schemaUpsertTask,
} from '../../slices/SchemaSlice';
import RateableTask from '../../model/RateableTask';
import TaskNameInput from './TaskNameInput';
import SelectTaskType from './SelectTaskType';
import Rating from '../../model/Rating';
import InitModeTooltip from './InitModeTooltip';
import { selectSettingsSchema } from '../../slices/SettingsSlice';
import InitializationMode, {
  getInitialValue,
} from '../../model/InitializationMode';

type SchemaRateableTaskProps = {
  task: RateableTask;
  rating: Rating;
  type: string;
};

export default function SchemaRateableTask(props: SchemaRateableTaskProps) {
  const { task, rating, type } = props;
  const dispatch = useDispatch();
  const settings = useSelector(selectSettingsSchema);

  const [expanded, setExpanded] = React.useState(false);

  function onChangeValue(e: ChangeEvent<{ value: unknown }>) {
    e.stopPropagation();
    const value = Math.min(e.target.value as number, task.max);
    dispatch(
      schemaUpsertRating({
        id: rating.id,
        task: rating.task.id,
        comment: rating.comment.id,
        value,
      })
    );
  }

  function onChangeMax(e: ChangeEvent<{ value: unknown }>) {
    e.stopPropagation();
    const temp = { ...task };
    const newMax: number = parseFloat(e.target.value as string);
    if (
      rating.value > newMax ||
      settings.initMode !== InitializationMode.MANUAL
    ) {
      dispatch(
        schemaUpsertRating({
          id: rating.id,
          task: rating.task.id,
          comment: rating.comment.id,
          value: getInitialValue(settings.initMode, newMax, newMax),
        })
      );
    }
    temp.max = newMax;
    dispatch(schemaUpsertTask(temp));
  }

  function onChangeStep(e: ChangeEvent<{ value: unknown }>) {
    e.stopPropagation();
    const temp = { ...task };
    temp.step = e.target.value as number;
    dispatch(schemaUpsertTask(temp));
  }

  function onChangeComment(e: ChangeEvent<{ value: unknown }>) {
    e.stopPropagation();
    dispatch(
      schemaUpsertComment({
        id: rating.comment.id,
        task: rating.comment.task.id,
        text: e.target.value as string,
      })
    );
  }

  function handleExpandClick(e) {
    e.stopPropagation();
    if (expanded) {
      dispatch(schemaClearSelectedTask());
    } else {
      dispatch(schemaSetSelectedTask(task.id));
    }
    setExpanded(!expanded);
  }

  return (
    <>
      <TaskNameInput task={task} />
      <InitModeTooltip>
        <TextField
          label="Inital Value"
          id="value"
          name="value"
          style={{ width: `${type.length * 0.6 + 6}em` }}
          type="number"
          value={rating.value}
          className={styles.fields}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{type}</InputAdornment>
            ),
            readOnly: settings.initMode !== InitializationMode.MANUAL,
          }}
          inputProps={{ min: 0, max: task.max, step: task.step }}
          onChange={onChangeValue}
          onClick={(e) => e.stopPropagation()}
          size="small"
          variant="outlined"
        />
      </InitModeTooltip>
      <TextField
        label="Max"
        id="max"
        name="max"
        style={{ width: `${type.length * 0.6 + 6}em` }}
        type="number"
        value={task.max}
        className={styles.fields}
        InputProps={{
          endAdornment: <InputAdornment position="end">{type}</InputAdornment>,
        }}
        inputProps={{ min: 0, step: task.step }}
        onChange={onChangeMax}
        onClick={(e) => e.stopPropagation()}
        size="small"
        variant="outlined"
        error={task.max <= 0}
      />
      <IconButton
        onClick={handleExpandClick}
        aria-expanded={expanded}
        aria-label="show more"
        className={styles.expand}
        size="medium"
      >
        {expanded ? (
          <ExpandLess className={styles.expandIcon} />
        ) : (
          <ExpandMore className={styles.expandIcon} />
        )}
      </IconButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <TextField
          id="outlined-number"
          label="Step"
          type="number"
          name="step"
          style={{ width: '5em' }}
          className={styles.fields}
          value={task.step}
          inputProps={{ min: '0.5', step: '0.5' }}
          onChange={onChangeStep}
          onClick={(e) => e.stopPropagation()}
          variant="outlined"
          size="small"
        />
        <SelectTaskType task={task} />
        <TextField
          id="comment"
          label="Comment"
          multiline
          className={styles.comment}
          name="comment"
          value={rating.comment.text}
          onChange={onChangeComment}
          onClick={(e) => e.stopPropagation()}
          variant="outlined"
          size="small"
        />
      </Collapse>
    </>
  );
}
