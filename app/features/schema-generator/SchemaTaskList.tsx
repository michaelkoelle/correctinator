/* eslint-disable import/no-cycle */
import { List, ListItem } from '@material-ui/core';
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

  return (
    <List style={{ paddingBottom: disableGutters ? 0 : undefined }}>
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
