/* eslint-disable import/no-cycle */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import {
  generateComment,
  generateRating,
  generateSimpleTask,
  generateSingleChoiceTask,
} from '../utils/Generator';
import {
  isParentTask,
  isParentTaskEntity,
  isSingleChoiceTask,
} from '../utils/TaskUtil';
import CommentEntity from './CommentEntity';
import ParentTaskEntity from './ParentTaskEntity';
import RateableTask from './RateableTask';
import RatingEntity from './RatingEntity';
import SingleChoiceTask from './SingleChoiceTask';
import Task from './Task';
import TaskEntity from './TaskEntity';
import TaskType from './TaskType';

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
    /*
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
    */
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

export function convertToRateableTask(
  task: TaskEntity,
  newTask: RateableTask | SingleChoiceTask
) {
  return (dispatch, getState) => {
    const state = getState();
    if (isParentTaskEntity(task)) {
      // Create new rating and comment for rateable task
      const comment = generateComment(newTask);
      const rating = generateRating(newTask, comment);

      dispatch(schemaUpsertComment(comment));
      dispatch(schemaUpsertRating(rating));
    } else {
      // Set Value of Rating of SC Task to 0
      const rating = Object.values<RatingEntity>(state.schema.ratings).find(
        (r) => r.task === task.id
      );
      if (rating) {
        const temp = { ...rating };
        temp.value = 0;
        dispatch(schemaUpsertRating(temp));
      }
    }
    // Finally update task
    dispatch(schemaUpsertTask(newTask));
  };
}

export function convertToParentTask(
  task: TaskEntity,
  newTask: ParentTaskEntity
) {
  return (dispatch, getState) => {
    const state = getState();
    // Remove now unused rating and comment
    const rating = Object.values<RatingEntity>(state.schema.ratings).find(
      (r) => r.task === task.id
    );
    if (rating) {
      dispatch(schemaRemoveRating(rating.id));
    }

    const comment = Object.values<CommentEntity>(state.schema.comments).find(
      (c) => c.task === task.id
    );
    if (comment) {
      dispatch(schemaRemoveComment(comment.id));
    }

    // Finally update task
    dispatch(schemaUpsertTask(newTask));
  };
}

export function convertTask(
  task: TaskEntity,
  type: TaskType,
  subtask?: TaskEntity
) {
  return (dispatch) => {
    switch (type) {
      case TaskType.Simple: {
        const template = generateSimpleTask();
        const simpleTask: RateableTask = {
          id: task.id,
          name: task.name,
          max: template.max,
          step: template.step,
          delimiter: task.delimiter,
        };
        dispatch(convertToRateableTask(task, simpleTask));
        break;
      }
      case TaskType.SingleChoice: {
        const template = generateSingleChoiceTask();
        const singleChoiceTask: SingleChoiceTask = {
          id: task.id,
          name: task.name,
          answer: {
            value: template.answer.value,
            text: template.answer.text,
          },
          delimiter: task.delimiter,
        };
        dispatch(convertToRateableTask(task, singleChoiceTask));
        break;
      }
      case TaskType.Parent: {
        // Convert Rateable Task to Parent Task
        const parentTask: ParentTaskEntity = {
          id: task.id,
          name: task.name,
          tasks: subtask ? [subtask.id] : [],
          delimiter: task.delimiter,
        };
        dispatch(convertToParentTask(task, parentTask));
        break;
      }
      default:
        throw new Error('Cannot task convert to unknown task type');
    }
  };
}

export function schemaAddSubtask(parentId: string, task: TaskEntity) {
  return (dispatch, getState) => {
    const state = getState();
    const tasks = new Map<string, TaskEntity>(
      Object.entries(state.schema.tasks)
    );
    const parent = tasks.get(parentId);
    if (parent) {
      if (isParentTaskEntity(parent)) {
        // Add subtask to children
        const temp = { ...parent };
        temp.tasks = [...temp.tasks, task.id];
        dispatch(schemaUpsertTask(temp));
        // tasks.set(parent.id, parent);
      } else {
        // Convert Rateable Task to Parent Task
        dispatch(convertTask(parent, TaskType.Parent, task));
      }
      dispatch(schemaUpsertTask(task));
    }
  };
}

export function schemaAddSimpleSubtask(parentId: string) {
  return (dispatch) => {
    const task = generateSimpleTask();
    const comment = generateComment(task);
    const rating = generateRating(task, comment);
    dispatch(schemaUpsertComment(comment));
    dispatch(schemaUpsertRating(rating));
    dispatch(schemaAddSubtask(parentId, task));
  };
}

export function schemaAddSimpleTask() {
  return (dispatch) => {
    const task = generateSimpleTask();
    const comment = generateComment(task);
    const rating = generateRating(task, comment);
    dispatch(schemaUpsertComment(comment));
    dispatch(schemaUpsertRating(rating));
    dispatch(schemaUpsertTask(task));
  };
}

export function removeSchemaTaskById(id: string) {
  return (dispatch, getState) => {
    let state: SchemaState = getState().schema;
    const tasks = new Map(Object.entries(state.tasks));
    const task: TaskEntity | undefined = tasks.get(id);

    if (!task) {
      return;
    }

    tasks.forEach((t) => {
      if (isParentTaskEntity(t)) {
        const temp: TaskEntity = { ...t };
        if (t.tasks.includes(id)) {
          temp.tasks = t.tasks.filter((tId) => tId !== id);
          // If this was the only subtask, convert parent task to simple task
          if (temp.tasks.length <= 0) {
            dispatch(convertTask(temp, TaskType.Simple));
          } else {
            // Update parent task
            dispatch(schemaUpsertTask(temp));
          }
        }
      }
    });

    if (isParentTaskEntity(task)) {
      // remove all the child tasks
      task.tasks.forEach((t) => {
        dispatch(removeSchemaTaskById(t));
      });
    }

    // Finally remove initial task
    dispatch(schemaRemoveTask(id));

    // Get updated state
    state = getState().schema;

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
