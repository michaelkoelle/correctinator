import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CancelIcon from '@material-ui/icons/Cancel';
import { Paper, IconButton, Grid } from '@material-ui/core';
import {
  removeSchemaTaskById,
  schemaAddTask,
  schemaClearSelectedTask,
  schemaSetSelectedTask,
  selectSchemaSelectedTaskId,
} from '../../slices/SchemaSlice';
import Task from '../../model/Task';
import SplitButton from '../../components/SplitButton';
import TaskType from '../../model/TaskType';

type SchemaTaskCardProps = {
  task: Task;
  depth: number;
  children: JSX.Element[];
};

export default function SchemaTaskCard(props: SchemaTaskCardProps) {
  const { task, depth, children } = props;
  const dispatch = useDispatch();
  const [hoverDeleteButton, setHoverDeleteButton] = useState<boolean>(false);
  const selectedTask: string | undefined = useSelector(
    selectSchemaSelectedTaskId
  );
  const selected: boolean = selectedTask === task.id;
  const INDENT_SIZE = 15;
  const marginLeft = `${depth * INDENT_SIZE}pt`;

  function onDelete(event) {
    event.stopPropagation();
    event.preventDefault();
    dispatch(removeSchemaTaskById(task.id));
  }

  function onSelection(e) {
    e.stopPropagation();
    if (selected) {
      dispatch(schemaClearSelectedTask());
    } else {
      dispatch(schemaSetSelectedTask(task.id));
    }
  }

  return (
    <Paper
      style={{
        padding: '10px',
        // padding: '15px',
        paddingRight: '0px',
        margin: '0px',
        marginLeft,
        marginRight: '-1px',
        borderTopRightRadius: '0px',
        borderBottomRightRadius: '0px',
        // margin: hover ? `0 0 20px 0` : `0 0 10px 0`,
        position: 'relative',
        width: '100%',
      }}
      elevation={selected ? 3 : 0}
      variant={selected ? 'elevation' : 'outlined'}
      className="MuiPaper-outlined"
      onClick={onSelection}
    >
      <IconButton
        onClick={onDelete}
        onMouseEnter={() => setHoverDeleteButton(true)}
        onMouseOver={() => setHoverDeleteButton(true)}
        onMouseLeave={() => setHoverDeleteButton(false)}
        style={{
          padding: '0px',
          position: 'absolute',
          top: '-7px',
          right: '-7px',
          opacity: hoverDeleteButton || selected ? 1 : 0,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <CancelIcon />
      </IconButton>

      {children}

      <Grid
        container
        direction="column"
        justify="center"
        alignItems="flex-end"
        style={{
          margin: '10px 0 0 0',
          display: selected ? 'flex' : 'none',
        }}
      >
        <Grid item>
          <SplitButton
            style={{ margin: '0 10px 0 0' }}
            options={[
              {
                name: 'Add Task',
                onClick: (event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  dispatch(schemaAddTask(TaskType.Simple, task.id));
                },
              },
              {
                name: 'Add Single Choice',
                onClick: (event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  dispatch(schemaAddTask(TaskType.SingleChoice, task.id));
                },
              },
            ]}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
