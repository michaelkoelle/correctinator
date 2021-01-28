/* eslint-disable import/no-cycle */
import { List, ListItem } from '@material-ui/core';
import React from 'react';
import Rating from '../../model/Rating';
import Task from '../../model/Task';
import TaskCorrection from './TaskCorrection';

type TaskCorrectionList = {
  tasks: Task[];
  ratings: Rating[];
  type: string;
  // eslint-disable-next-line react/require-default-props
  disableGutters?: boolean;
};

function TaskListView(props: TaskCorrectionList) {
  const { tasks, ratings, type, disableGutters = false } = props;

  return (
    <List style={{ paddingBottom: disableGutters ? 0 : undefined }}>
      {tasks?.map((t: any, i: number, a: any[]) => {
        return (
          <ListItem
            key={t?.id}
            disableGutters={disableGutters}
            style={{
              paddingBottom: a?.length === i + 1 ? 0 : undefined,
            }}
          >
            <TaskCorrection task={t} type={type} ratings={ratings} />
          </ListItem>
        );
      })}
    </List>
  );
}

export default TaskListView;
