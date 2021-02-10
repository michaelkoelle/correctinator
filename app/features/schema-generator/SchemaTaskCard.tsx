import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from '@material-ui/icons/Add';
import { Paper, IconButton, Button, Grid } from '@material-ui/core';
import { CSSTransition, Transition } from 'react-transition-group';
import {
  removeSchemaTaskById,
  schemaAddSimpleSubtask,
  schemaClearSelectedTask,
  schemaSetSelectedTask,
  selectSchemaSelectedTaskId,
} from '../../model/SchemaSlice';
import Task from '../../model/Task';

type SchemaTaskCardProps = {
  task: Task;
  depth: number;
  expanded: boolean;
  children: JSX.Element[];
};

export default function SchemaTaskCard(props: SchemaTaskCardProps) {
  const { task, depth, expanded, children } = props;
  const dispatch = useDispatch();
  const [hoverDeleteButton, setHoverDeleteButton] = useState<boolean>(false);
  const selectedTask: string | undefined = useSelector(
    selectSchemaSelectedTaskId
  );
  const selected: boolean = selectedTask === task.id || expanded;
  const INDENT_SIZE = 15;
  const marginLeft = `${depth * INDENT_SIZE}pt`;

  function onDelete() {
    dispatch(removeSchemaTaskById(task.id));
  }

  function onAddSubTask(e) {
    e.stopPropagation();
    dispatch(schemaAddSimpleSubtask(task.id));
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
          <Button
            onClick={onAddSubTask}
            variant="contained"
            size="small"
            style={{
              margin: '0 10px 0 0',
            }}
          >
            Add subtask
            <AddIcon fontSize="small" style={{ marginBottom: '3px' }} />
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
