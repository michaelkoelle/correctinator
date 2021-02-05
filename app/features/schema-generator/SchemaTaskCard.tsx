import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from '@material-ui/icons/Add';
import { Paper, IconButton, Button } from '@material-ui/core';
import {
  removeSchemaTaskById,
  schemaAddSimpleSubtask,
} from '../../model/SchemaSlice';
import Task from '../../model/Task';

type SchemaTaskCardProps = {
  task: Task;
  depth: number;
  children: JSX.Element[];
};

export default function SchemaTaskCard(props: SchemaTaskCardProps) {
  const { task, depth, children } = props;
  const dispatch = useDispatch();
  const [hover, setHover] = useState<boolean>();

  const INDENT_SIZE = 25;
  const marginLeft = `${depth * INDENT_SIZE}pt`;

  function onHoverStart() {
    setHover(true);
  }

  function onHoverEnd() {
    setHover(false);
  }

  function onDelete() {
    dispatch(removeSchemaTaskById(task.id));
  }

  function onAddSubTask() {
    dispatch(schemaAddSimpleSubtask(task.id));
  }

  return (
    <Paper
      style={{
        padding: '10px',
        margin: hover ? `0 0 20px ${marginLeft}` : `0 0 10px ${marginLeft}`,
        position: 'relative',
      }}
      elevation={hover ? 3 : 0}
      variant={hover ? 'elevation' : 'outlined'}
      className="MuiPaper-outlined"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onMouseOver={onHoverStart}
    >
      {hover ? (
        <>
          <IconButton
            onClick={onDelete}
            style={{
              padding: '0px',
              position: 'absolute',
              top: '-7px',
              right: '-7px',
            }}
          >
            <CancelIcon />
          </IconButton>
          <Button
            onClick={onAddSubTask}
            variant="contained"
            style={{
              padding: '2px 2px 0px 8px',
              position: 'absolute',
              bottom: '-13px',
              right: '15px',
            }}
          >
            Add subtask
            <AddIcon fontSize="small" style={{ marginBottom: '3px' }} />
          </Button>
        </>
      ) : (
        <></>
      )}
      {children}
    </Paper>
  );
}
