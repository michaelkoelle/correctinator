/* eslint-disable import/no-cycle */
import { List, ListItem, Typography, useTheme } from '@material-ui/core';
import React from 'react';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import SchemaTaskView from './SchemaTaskView';

type TaskCorrectionList = {
  tasks: Task[];
  ratings: Rating[];
  type: string;
  depth: number;
  // eslint-disable-next-line react/require-default-props
  disableGutters?: boolean;
};

export default function SchemaTaskList(props: TaskCorrectionList) {
  const { tasks, ratings, type, depth, disableGutters = false } = props;
  const theme = useTheme();

  return (
    <List
      style={{
        paddingBottom: disableGutters ? 0 : undefined,
        height: '100%',
      }}
    >
      {tasks?.length === 0 && (
        <>
          <Typography
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '24px',
              color: theme.palette.text.disabled,
            }}
          >
            No tasks specified yet!
          </Typography>
          <Typography
            style={{
              width: '100%',
              textAlign: 'center',
              color: theme.palette.text.disabled,
            }}
          >
            You can add a tasks with the button above!
          </Typography>
        </>
      )}
      {tasks?.map((t: Task, i: number, a: Task[]) => {
        return (
          <ListItem
            key={t?.id}
            disableGutters={disableGutters}
            style={{
              paddingBottom: a?.length === i + 1 ? 0 : undefined,
            }}
          >
            <SchemaTaskView
              task={t}
              type={type}
              ratings={ratings}
              depth={depth}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
