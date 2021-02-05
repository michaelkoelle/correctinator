import React, { ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';
import { InputAdornment } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import styles from './TaskScheme.css';
import { schemaUpdateTask } from '../../model/SchemaSlice';
import BaseTask from '../../model/BaseTask';

type TaskNameInputProps = {
  task: BaseTask;
};

export default function TaskNameInput(props: TaskNameInputProps) {
  const { task } = props;
  const dispatch = useDispatch();

  function onChangeName(e: ChangeEvent<{ value: unknown }>) {
    const newName = e.target.value as string;
    const pattern = /(.+)([:|)|.|#|?|!]$)/g;
    const result = pattern.exec(newName);
    let delimiter = ':';
    if (result && result[2]) {
      // eslint-disable-next-line prefer-destructuring
      delimiter = result[2];
    } else if (task.delimiter) {
      delimiter = task.delimiter;
    }
    dispatch(
      schemaUpdateTask({
        id: task.id,
        changes: {
          name: result && result[1] ? result[1] : newName,
          delimiter,
        },
      })
    );
  }

  return (
    <TextField
      id="outlined-number"
      label="Task name"
      multiline
      name="name"
      value={task.name}
      onChange={onChangeName}
      style={{ width: `${21 * 0.6}em` }}
      className={styles.fields}
      rowsMax="1"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {task.delimiter ? task.delimiter : ':'}
          </InputAdornment>
        ),
      }}
      variant="outlined"
      size="small"
    />
  );
}
