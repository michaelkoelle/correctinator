import React, { ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';
import { Card, InputAdornment } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import styles from './TaskScheme.css';
import {
  schemaSetSelectedTask,
  schemaUpdateTask,
  selectSchemaSelectedTaskId,
} from '../../model/SchemaSlice';
import ParentTask from '../../model/ParentTask';
import Rating from '../../model/Rating';
import {
  getMaxValueForTasks,
  getRatingValueForTasks,
} from '../../utils/Formatter';
import { hasTasksWithZeroMax } from '../../utils/TaskUtil';

type SchemaParentTaskProps = {
  task: ParentTask;
  ratings: Rating[];
  depth: number;
  type: string;
};

export default function SchemaParentTask(props: SchemaParentTaskProps) {
  const { task, ratings, depth, type } = props;

  const dispatch = useDispatch();
  const selectedTaskId: string | undefined = useSelector(
    selectSchemaSelectedTaskId
  );
  const selected: boolean =
    selectedTaskId !== undefined && selectedTaskId === task.id;

  const sumValue = getRatingValueForTasks(task.tasks, ratings);
  const sumMax = getMaxValueForTasks(task.tasks);

  const INDENT_SIZE = 25;
  const marginLeft = `${depth * INDENT_SIZE}pt`;

  function onChangeName(e: ChangeEvent<{ value: unknown }>) {
    dispatch(
      schemaUpdateTask({
        id: task.id,
        changes: {
          name: e.target.value as string,
        },
      })
    );
  }

  function onSelection() {
    if (!selected) {
      dispatch(schemaSetSelectedTask(task.id));
    }
  }

  return (
    <Card
      style={{ marginLeft }}
      raised={selected}
      className={styles.card}
      onClick={onSelection}
      onKeyDown={onSelection}
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
        value={sumValue}
        className={styles.fields}
        InputProps={{
          readOnly: true,
          endAdornment: <InputAdornment position="end">{type}</InputAdornment>,
        }}
        size="small"
        variant="outlined"
      />
      <TextField
        label="Max"
        id="max"
        name="max"
        style={{ width: `${type.length * 0.6 + 6}em` }}
        type="number"
        className={styles.fields}
        value={sumMax}
        InputProps={{
          readOnly: true,
          endAdornment: <InputAdornment position="end">{type}</InputAdornment>,
        }}
        size="small"
        variant="outlined"
        error={hasTasksWithZeroMax(task.tasks)}
      />
    </Card>
  );
}
