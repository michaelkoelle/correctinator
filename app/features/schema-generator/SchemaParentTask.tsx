import React from 'react';
import TextField from '@material-ui/core/TextField';
import { InputAdornment } from '@material-ui/core';
import styles from './TaskScheme.css';
import ParentTask from '../../model/ParentTask';
import Rating from '../../model/Rating';
import {
  getMaxValueForTasks,
  getRatingValueForTasks,
} from '../../utils/Formatter';
import { hasTasksWithZeroMax } from '../../utils/TaskUtil';
import TaskNameInput from './TaskNameInput';
import SchemaTaskCard from './SchemaTaskCard';

type SchemaParentTaskProps = {
  task: ParentTask;
  ratings: Rating[];
  depth: number;
  type: string;
};

export default function SchemaParentTask(props: SchemaParentTaskProps) {
  const { task, ratings, depth, type } = props;
  const sumValue = getRatingValueForTasks(task.tasks, ratings);
  const sumMax = getMaxValueForTasks(task.tasks);

  return (
    <SchemaTaskCard depth={depth} task={task}>
      <TaskNameInput task={task} />
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
    </SchemaTaskCard>
  );
}
