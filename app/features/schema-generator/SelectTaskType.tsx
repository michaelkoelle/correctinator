import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { convertTask } from '../../slices/SchemaSlice';
import TaskType from '../../model/TaskType';
import { getTaskType } from '../../utils/TaskUtil';
import TaskEntity from '../../model/TaskEntity';
import styles from './TaskScheme.css';

type SelectTaskTypeProps = {
  task: TaskEntity;
};

export default function SelectTaskType(props: SelectTaskTypeProps) {
  const { task } = props;
  const dispatch = useDispatch();

  return (
    <FormControl size="small" variant="outlined" className={styles.fields}>
      <InputLabel id="sheet-select-label">Task Type</InputLabel>
      <Select
        labelId="task-type-select-label"
        id="task-type-select"
        variant="outlined"
        value={getTaskType(task)}
        onChange={(e) => {
          dispatch(convertTask(task, e.target.value as TaskType));
        }}
        label="Task Type"
      >
        <MenuItem value={TaskType.Simple}>Simple Task</MenuItem>
        <MenuItem value={TaskType.SingleChoice}>Single Choice Task</MenuItem>
      </Select>
    </FormControl>
  );
}
