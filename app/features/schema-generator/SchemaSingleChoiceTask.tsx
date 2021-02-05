/* eslint-disable react/jsx-no-duplicate-props */
import React, { ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';
import {
  Checkbox,
  Collapse,
  IconButton,
  InputAdornment,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import styles from './TaskScheme.css';
import { schemaUpsertRating, schemaUpsertTask } from '../../model/SchemaSlice';
import RatingEntity from '../../model/RatingEntity';
import SingleChoiceTask from '../../model/SingleChoiceTask';
import TaskNameInput from './TaskNameInput';
import SchemaTaskCard from './SchemaTaskCard';
import SelectTaskType from './SelectTaskType';

type SchemaSingleChoiceTaskProps = {
  task: SingleChoiceTask;
  rating: RatingEntity;
  depth: number;
  type: string;
};

export default function SchemaSingleChoiceTask(
  props: SchemaSingleChoiceTaskProps
) {
  const { task, rating, depth, type } = props;
  const dispatch = useDispatch();
  const [expanded, setExpanded] = React.useState(false);

  function onChangeValue(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...task };
    const temp1 = { ...rating };
    const newMax: number = parseFloat(e.target.value as string);

    temp1.value = newMax;
    temp.answer = {
      value: newMax,
      text: temp.answer.text,
    };
    if (rating.value > 0) {
      dispatch(schemaUpsertRating(temp1));
    }
    dispatch(schemaUpsertTask(temp));
  }

  function onChangeText(e: ChangeEvent<{ value: unknown }>) {
    const temp = { ...task };
    temp.answer = { value: temp.answer.value, text: e.target.value as string };
    dispatch(schemaUpsertTask(temp));
  }

  function onChangeChoiceValue(event: React.ChangeEvent<HTMLInputElement>) {
    const temp = { ...rating };
    if (event.target.checked) {
      temp.value = task.answer.value;
    } else {
      temp.value = 0;
    }
    dispatch(schemaUpsertRating(temp));
  }

  return (
    <SchemaTaskCard depth={depth} task={task}>
      <TaskNameInput task={task} />
      <TextField
        label="Value"
        id="max"
        name="max"
        style={{ width: `${type.length * 0.6 + 6}em` }}
        type="number"
        value={task.answer.value}
        className={styles.fields}
        InputProps={{
          endAdornment: <InputAdornment position="end">{type}</InputAdornment>,
        }}
        inputProps={{ min: 0, step: 0.5 }}
        onChange={onChangeValue}
        size="small"
        variant="outlined"
        error={task.answer.value <= 0}
      />
      <TextField
        id="outlined-number"
        label="Answer"
        multiline
        name="answer"
        value={task.answer.text}
        onChange={onChangeText}
        className={styles.fields}
        style={{ width: '7em' }}
        variant="outlined"
        size="small"
      />
      <Checkbox
        title="Initial"
        color="primary"
        checked={rating.value > 0}
        style={{ marginTop: '4px' }}
        onChange={onChangeChoiceValue}
      />
      <IconButton
        onClick={() => setExpanded(!expanded)}
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
        <SelectTaskType task={task} />
      </Collapse>
    </SchemaTaskCard>
  );
}
