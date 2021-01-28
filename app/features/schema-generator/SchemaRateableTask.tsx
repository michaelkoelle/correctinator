/* eslint-disable react/jsx-no-duplicate-props */
import React, { ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';
import { Card, Collapse, IconButton, InputAdornment } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import styles from './TaskScheme.css';
import {
  schemaSetSelectedTask,
  schemaUpsertComment,
  schemaUpsertRating,
  schemaUpsertTask,
  selectSchemaSelectedTaskId,
} from '../../model/SchemaSlice';
import RateableTask from '../../model/RateableTask';
import RatingEntity from '../../model/RatingEntity';
import CommentEntity from '../../model/CommentEntity';

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
  const selectedTaskId: string | undefined = useSelector(
    selectSchemaSelectedTaskId
  );
  const selected: boolean =
    selectedTaskId !== undefined && selectedTaskId === task.id;

  const INDENT_SIZE = 25;
  const marginLeft = `${depth * INDENT_SIZE}pt`;

  const [expanded, setExpanded] = React.useState(false);

  function onChangeName(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...task };
    temp.name = e.target.value as string;
    dispatch(schemaUpsertTask(temp));
  }

  function onChangeValue(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...rating };
    temp.value = Math.min(e.target.value as number, task.max);
    dispatch(schemaUpsertRating(temp));
  }

  function onChangeMax(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...task };
    temp.max = Math.max(rating.value, e.target.value as number);
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

  function onSelection() {
    if (!selected) {
      dispatch(schemaSetSelectedTask(task.id));
    }
  }

  function handleExpandClick() {
    setExpanded(!expanded);
  }

  return (
    <Card
      raised={selected}
      variant="outlined"
      // variant={selected ? 'elevation' : undefined}
      style={{ marginLeft }}
      onClick={onSelection}
      onKeyDown={onSelection}
      // className={styles.card}
      className={[styles.card, selected ? styles.selected : ''].join(' ')}
    >
      <TextField
        id="outlined-number"
        label="Task name"
        multiline
        name="name"
        value={task.name}
        onChange={onChangeName}
        className={styles.fields}
        variant="outlined"
        size="small"
      />
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
        <TextField
          id="tasktype"
          label="Type"
          type="text"
          name="type"
          className={styles.fields}
          // style={{ width: '5em' }}
          value={type}
          variant="outlined"
          size="small"
          InputProps={{
            readOnly: true,
          }}
        />
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
    </Card>
  );
}
