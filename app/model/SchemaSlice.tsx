/* eslint-disable import/no-cycle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isParentTaskEntity } from '../utils/TaskUtil';
import CommentEntity from './CommentEntity';
import ParentTaskEntity from './ParentTaskEntity';
import RateableTask from './RateableTask';
import RatingEntity from './RatingEntity';
import TaskEntity from './TaskEntity';

export interface SchemaState {
  selectedTaskId: string | undefined;
  selectedSheetId: string | undefined;
  clipboard: string;
  tasks: { [key: string]: TaskEntity };
  ratings: { [key: string]: RatingEntity };
  comments: { [key: string]: CommentEntity };
}

const slice = createSlice({
  name: 'schema',
  initialState: {
    selectedTaskId: undefined,
    selectedSheetId: undefined,
    clipboard: '',
    tasks: {},
    ratings: {},
    comments: {},
  } as SchemaState,
  reducers: {
    schemaSetClipboard: (state, action: PayloadAction<string>) => {
      state.clipboard = action.payload;
    },
    schemaSetEntities: (
      state,
      action: PayloadAction<{
        tasks: { [key: string]: TaskEntity };
        ratings: { [key: string]: RatingEntity };
        comments: { [key: string]: CommentEntity };
      }>
    ) => {
      state.tasks = action.payload.tasks;
      state.ratings = action.payload.ratings;
      state.comments = action.payload.comments;
    },
    schemaSetSelectedTask: (state, action: PayloadAction<string>) => {
      state.selectedTaskId = action.payload;
    },
    schemaClearSelectedTask: (state) => {
      state.selectedTaskId = undefined;
    },
    schemaSetSelectedSheet: (state, action: PayloadAction<string>) => {
      state.selectedSheetId = action.payload;
    },
    schemaClearSelectedSheet: (state) => {
      state.selectedSheetId = undefined;
    },
    schemaSetTasks: (
      state,
      action: PayloadAction<{ [key: string]: TaskEntity }>
    ) => {
      state.tasks = action.payload;
    },
    schemaUpsertTask: (state, action: PayloadAction<TaskEntity>) => {
      state.tasks = Object.fromEntries(
        new Map(Object.entries(state.tasks)).set(
          action.payload.id,
          action.payload
        )
      );
    },
    schemaUpsertRating: (state, action: PayloadAction<RatingEntity>) => {
      state.ratings = Object.fromEntries(
        new Map(Object.entries(state.ratings)).set(
          action.payload.id,
          action.payload
        )
      );
    },
    schemaUpsertComment: (state, action: PayloadAction<CommentEntity>) => {
      state.comments = Object.fromEntries(
        new Map(Object.entries(state.comments)).set(
          action.payload.id,
          action.payload
        )
      );
    },
    schemaUpdateTask: (
      state,
      action: PayloadAction<{ id: string; changes: { [key: string]: unknown } }>
    ) => {
      Object.entries(action.payload.changes).forEach(([key, value]) => {
        state.tasks[action.payload.id][key] = value;
      });
    },
    schemaRemoveTask: (state, action: PayloadAction<string>) => {
      const map = new Map(Object.entries(state.tasks));
      map.delete(action.payload);
      state.tasks = Object.fromEntries(map);
    },
    schemaRemoveRating: (state, action: PayloadAction<string>) => {
      const map = new Map(Object.entries(state.ratings));
      map.delete(action.payload);
      state.ratings = Object.fromEntries(map);
    },
    schemaRemoveComment: (state, action: PayloadAction<string>) => {
      const map = new Map(Object.entries(state.comments));
      map.delete(action.payload);
      state.comments = Object.fromEntries(map);
    },
    schemaReset: (state) => {
      state.tasks = {};
      state.comments = {};
      state.ratings = {};
      state.selectedTaskId = undefined;
    },
    schemaAddSubtask: (
      state,
      action: PayloadAction<{ parentId: string; task: TaskEntity }>
    ) => {
      const tasks = new Map(Object.entries(state.tasks));
      const parent = tasks.get(action.payload.parentId);
      if (parent) {
        if (isParentTaskEntity(parent)) {
          // Add subtask to children
          parent.tasks.push(action.payload.task.id);
          tasks.set(parent.id, parent);
        } else {
          // Convert Rateable Task to Parent Task
          const temp: ParentTaskEntity = {
            id: parent.id,
            name: parent.name,
            tasks: [action.payload.task.id],
          };
          tasks.set(parent.id, temp);
        }
        tasks.set(action.payload.task.id, action.payload.task);
      }
      state.tasks = Object.fromEntries(tasks);
    },
  },
});

export const {
  schemaUpsertTask,
  schemaUpsertComment,
  schemaUpsertRating,
  schemaRemoveTask,
  schemaRemoveComment,
  schemaRemoveRating,
  schemaReset,
  schemaSetSelectedTask,
  schemaClearSelectedTask,
  schemaSetSelectedSheet,
  schemaClearSelectedSheet,
  schemaAddSubtask,
  schemaUpdateTask,
  schemaSetTasks,
  schemaSetEntities,
  schemaSetClipboard,
} = slice.actions;

export const selectSchemaEntities = (state) => {
  const { tasks, ratings, comments } = state.schema;

  return {
    tasks,
    ratings,
    comments,
  };
};
export const selectSchemaClipboard = (state) => state.schema.clipboard;
export const selectSchemaTasks = (state) =>
  Object.values<TaskEntity>(state.schema.tasks);
export const selectSchemaComments = (state) =>
  Object.values<CommentEntity>(state.schema.comments);
export const selectSchemaRatings = (state) =>
  Object.values<RatingEntity>(state.schema.ratings);
export const selectSchemaSelectedTaskId = (state) =>
  state.schema.selectedTaskId;
export const selectSchemaSelectedSheetId = (state) =>
  state.schema.selectedSheetId;
export const selectSchema = (state) => state.schema;
export const selectTaskBySheetId = (taskId: string) => {
  return (state) => state.schema.tasks.get(taskId);
};
export const selectRatingEntityByTaskId = (id: string) => {
  return (state) => {
    return Object.values<RatingEntity>(state.schema.ratings).find(
      (r) => r.task === id
    );
  };
};

export default slice.reducer;

export function removeSchemaTaskById(id: string) {
  return (dispatch, getState) => {
    const state: SchemaState = getState().schema;
    const tasks = new Map(Object.entries(state.tasks));
    const task: TaskEntity | undefined = tasks.get(id);
    if (!task) {
      return;
    }

    if (isParentTaskEntity(task)) {
      // remove all the child tasks
      task.tasks.forEach((t) => {
        dispatch(schemaRemoveTask(t));
        Object.values(state.comments).forEach((c) => {
          if (c.task === t) {
            dispatch(schemaRemoveComment(c.id));
          }
        });
        Object.values(state.ratings).forEach((r) => {
          if (r.task === t) {
            dispatch(schemaRemoveRating(r.id));
          }
        });
      });
    }
    tasks.forEach((t) => {
      if (isParentTaskEntity(t)) {
        let temp: TaskEntity = { ...t };
        if (t.tasks.includes(id)) {
          temp.tasks = t.tasks.filter((tId) => tId !== id);
          // If this was the only subtask, parent task will now be a Rateable Task
          if (temp.tasks.length <= 0) {
            const rTask: RateableTask = {
              id: t.id,
              name: t.name,
              max: 0,
              step: 0.5,
            };
            temp = rTask;
          }
          // Update parent task
          dispatch(schemaUpsertTask(temp));
        }
      }
    });

    // Finally remove initial task
    // dispatch(schemaSetTasks(Object.fromEntries(tasks)));
    dispatch(schemaRemoveTask(id));

    // Remove associated Rating and Comment
    Object.values(state.comments).forEach((c) => {
      if (c.task === id) {
        dispatch(schemaRemoveComment(c.id));
      }
    });
    Object.values(state.ratings).forEach((r) => {
      if (r.task === id) {
        dispatch(schemaRemoveRating(r.id));
      }
    });
  };
}
