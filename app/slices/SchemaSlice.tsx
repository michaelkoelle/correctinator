/* eslint-disable import/no-cycle */
import { v4 as uuidv4 } from 'uuid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { denormalize } from 'normalizr';
import { getMaxValueForTasks } from '../utils/Formatter';
import {
  generateComment,
  generateRating,
  generateTask,
} from '../utils/Generator';
import {
  flatMapTasksFromSheetEntity,
  isParentTaskEntity,
  isRateableTask,
  isSingleChoiceTask,
} from '../utils/TaskUtil';
import CommentEntity from '../model/CommentEntity';
import { commentsRemoveMany, commentsUpsertMany } from './CommentSlice';
import CorrectionEntity from '../model/CorrectionEntity';
import { correctionsUpsertMany } from './CorrectionsSlice';
import { TasksSchema } from '../model/NormalizationSchema';
import ParentTaskEntity from '../model/ParentTaskEntity';
import RateableTask from '../model/RateableTask';
import RatingEntity from '../model/RatingEntity';
import { ratingsRemoveMany, ratingsUpsertMany } from './RatingSlice';
import { sheetsUpsertOne } from './SheetSlice';
import SingleChoiceTask from '../model/SingleChoiceTask';
import Task from '../model/Task';
import TaskEntity from '../model/TaskEntity';
import { tasksRemoveMany, tasksUpsertMany } from './TaskSlice';
import TaskType from '../model/TaskType';
import SheetEntity from '../model/SheetEntity';

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
    schemaClearSelectedSheetWithId: (state, action: PayloadAction<string>) => {
      state.selectedSheetId =
        action.payload === state.selectedSheetId
          ? undefined
          : state.selectedSheetId;
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
  schemaClearSelectedSheetWithId,
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
  newTask: RateableTask | SingleChoiceTask,
  ratingValue?: number | undefined,
  commentText?: string | undefined
) {
  return (dispatch, getState) => {
    const state = getState();
    if (isParentTaskEntity(task)) {
      // Create new rating and comment for rateable task
      const comment = generateComment(newTask);
      const rating = generateRating(newTask, comment);

      // Overwrite default parameter
      rating.value = ratingValue || rating.value;
      comment.text = commentText || comment.text;

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
        const template = generateTask(TaskType.Simple) as RateableTask;
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
        const template = generateTask(
          TaskType.SingleChoice
        ) as SingleChoiceTask;
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

export function schemaAddTask(type: TaskType, parentId?: string) {
  const task = generateTask(TaskType.Simple) as RateableTask;
  const comment = generateComment(task);
  const rating = generateRating(task, comment);

  return (dispatch, getState) => {
    // Logic to handle inserting a subtask
    if (parentId) {
      const state = getState();
      const tasks = new Map<string, TaskEntity>(
        Object.entries(state.schema.tasks)
      );

      const parent = tasks.get(parentId);

      if (!parent) {
        return;
      }

      if (isParentTaskEntity(parent)) {
        // Add subtask to children
        const temp = { ...parent };
        temp.tasks = [...temp.tasks, task.id];
        dispatch(schemaUpsertTask(temp));
      } else {
        // Carry over max points, step, value and comment to subtask
        task.max = (parent as RateableTask).max;
        task.step = (parent as RateableTask).step;
        const oldRating = Object.values<RatingEntity>(
          state.schema.ratings
        ).find((r) => r.task === parent.id);

        if (oldRating) {
          rating.value =
            oldRating.value <= task.max ? oldRating.value : task.max;
          const oldComment = Object.values<CommentEntity>(
            state.schema.comments
          ).find((c) => c.id === oldRating.comment);
          if (oldComment) {
            comment.text = oldComment.text;
          }
        }
        // Convert Rateable Task to Parent Task
        dispatch(convertTask(parent, TaskType.Parent, task));
      }
    }

    dispatch(schemaUpsertComment(comment));
    dispatch(schemaUpsertRating(rating));
    dispatch(schemaUpsertTask(task));
    dispatch(convertTask(task, type));
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
            const template = generateTask(TaskType.Simple) as RateableTask;
            const oldRatingValue = Object.values(state.ratings).find(
              (r) => r.task === task.id
            )?.value;
            const oldCommentText = Object.values(state.comments).find(
              (c) => c.task === task.id
            )?.text;

            let { max } = template;
            if (isRateableTask(task)) {
              max = task.max;
            } else if (isSingleChoiceTask(task)) {
              max = task.answer.value;
            } else if (isParentTaskEntity(task)) {
              const ts: Task[] = denormalize(
                task.tasks,
                TasksSchema,
                selectSchemaEntities(getState())
              );
              max = getMaxValueForTasks(ts);
            }

            const simpleTask: RateableTask = {
              id: temp.id,
              name: temp.name,
              max,
              step: isRateableTask(task) ? task.step : template.step,
              delimiter: temp.delimiter,
            };
            dispatch(
              convertToRateableTask(
                temp,
                simpleTask,
                oldRatingValue,
                oldCommentText
              )
            );
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

export function initializeSheet(
  sheetId: string,
  tasks: TaskEntity[],
  ratings: RatingEntity[],
  comments: CommentEntity[],
  topLevelTaskIds: string[]
) {
  return (dispatch, getState) => {
    const state = getState();
    const sheet: SheetEntity = state.sheets.entities[sheetId];
    const tasksOfSheet: TaskEntity[] = flatMapTasksFromSheetEntity(
      sheet,
      state
    );
    const correctionsOfSheet = Object.values<CorrectionEntity>(
      state.corrections.entities
    ).filter((c) => state.submissions.entities[c.submission].sheet === sheetId);

    dispatch(tasksUpsertMany(tasks));

    if (sheet) {
      const temp = { ...sheet };
      temp.tasks = topLevelTaskIds;
      dispatch(sheetsUpsertOne(temp));
    }

    const allComments: CommentEntity[] = [];
    const allRatings: RatingEntity[] = [];

    const allCorrections: CorrectionEntity[] = [];
    correctionsOfSheet.forEach((c) => {
      const ratingsForCorrection: RatingEntity[] = [];
      ratings.forEach((r) => {
        const newComment = comments.find((comment) => comment.id === r.comment);
        const tempRating = { ...r };
        if (newComment) {
          const tempComment = { ...newComment };
          tempComment.id = uuidv4();
          allComments.push(tempComment);
          tempRating.comment = tempComment.id;
        }
        tempRating.id = uuidv4();
        ratingsForCorrection.push(tempRating);
        allRatings.push(tempRating);
      });
      const tempCorrection = { ...c };
      tempCorrection.ratings = ratingsForCorrection.map((r) => r.id);
      allCorrections.push(tempCorrection);
    });
    dispatch(commentsUpsertMany(allComments));
    dispatch(ratingsUpsertMany(allRatings));
    dispatch(correctionsUpsertMany(allCorrections));

    // Delete all unused tasks and tasks that were previously a parent task
    const toDelete = tasksOfSheet
      .filter((t) => {
        const updatedTask = tasks.find((tsk) => tsk.id === t.id);
        // Unused tasks
        const unusedTask = updatedTask === undefined;
        // Tasks that were previously a parent task
        const previouslyParent =
          updatedTask !== undefined &&
          isParentTaskEntity(t) &&
          !isParentTaskEntity(updatedTask);
        return unusedTask || previouslyParent;
      })
      .map((t) => t.id);
    if (toDelete.length > 0) {
      dispatch(
        tasksRemoveMany(
          tasksOfSheet
            .filter((t) => {
              const updatedTask = tasks.find((tsk) => tsk.id === t.id);
              // Unused tasks
              const unusedTask = updatedTask === undefined;
              // Tasks that were previously a parent task
              const previouslyParent =
                updatedTask !== undefined &&
                isParentTaskEntity(t) &&
                !isParentTaskEntity(updatedTask);
              return unusedTask || previouslyParent;
            })
            .map((t) => t.id)
        )
      );
    }

    // Delete all unused ratings and comments
    const ratingsToDelete: string[] = [];
    const commentsToDelete: string[] = [];
    correctionsOfSheet.forEach((c) =>
      c.ratings?.forEach((r) => {
        const rating: RatingEntity = state.ratings.entities[r];
        ratingsToDelete.push(rating.id);
        commentsToDelete.push(rating.comment);
      })
    );
    if (ratingsToDelete.length > 0 && commentsToDelete.length > 0) {
      dispatch(ratingsRemoveMany(ratingsToDelete));
      dispatch(commentsRemoveMany(commentsToDelete));
    }
  };
}
