/* eslint-disable react/jsx-no-duplicate-props */
import React, { ChangeEvent, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import {
  Card,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import CancelIcon from '@material-ui/icons/Cancel';
import { useDispatch, useSelector } from 'react-redux';
import styles from './TaskScheme.css';
import {
  convertTask,
  schemaSetSelectedTask,
  schemaUpsertComment,
  schemaUpsertRating,
  schemaUpsertTask,
  selectSchemaSelectedTaskId,
} from '../../model/SchemaSlice';
import RateableTask from '../../model/RateableTask';
import RatingEntity from '../../model/RatingEntity';
import CommentEntity from '../../model/CommentEntity';
import TaskNameInput from './TaskNameInput';
import SchemaTaskCard from './SchemaTaskCard';
import TaskType from '../../model/TaskType';
import { getTaskType } from '../../utils/TaskUtil';
import SelectTaskType from './SelectTaskType';

type SchemaRateableTaskProps = {
  task: RateableTask;
  rating: RatingEntity;
  comment: CommentEntity;
  depth: number;
  type: string;
};

export default function SchemaRateableTask(props: SchemaRateableTaskProps) {
  const { task, rating, comment, depth, type } = props;
  const dispatch = useDispatch();

  const [expanded, setExpanded] = React.useState(false);

  function onChangeValue(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...rating };
    temp.value = Math.min(e.target.value as number, task.max);
    dispatch(schemaUpsertRating(temp));
  }

  function onChangeMax(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...task };
    const temp1 = { ...rating };
    const newMax: number = e.target.value as number;
    if (temp1.value > newMax) {
      temp1.value = newMax;
      dispatch(schemaUpsertRating(temp1));
    }
    temp.max = Math.max(temp1.value, newMax);
    dispatch(schemaUpsertTask(temp));
  }

  function onChangeStep(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...task };
    temp.step = e.target.value as number;
    dispatch(schemaUpsertTask(temp));
  }

  function onChangeComment(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...comment };
    temp.text = e.target.value as string;
    dispatch(schemaUpsertComment(temp));
  }

  function handleExpandClick() {
    setExpanded(!expanded);
  }

  return (
    <SchemaTaskCard depth={depth} task={task}>
      <TaskNameInput task={task} />
      <TextField
        label="Inital"
        id="value"
        name="value"
        style={{ width: `${type.length * 0.6 + 6}em` }}
        type="number"
        value={rating.value}
        className={styles.fields}
        InputProps={{
          endAdornment: <InputAdornment position="end">{type}</InputAdornment>,
        }}
        inputProps={{ min: 0, max: task.max, step: task.step }}
        onChange={onChangeValue}
        size="small"
        variant="outlined"
      />
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
          value={comment.text}
          onChange={onChangeComment}
          variant="outlined"
          size="small"
        />
      </Collapse>
    </SchemaTaskCard>
  );
}
