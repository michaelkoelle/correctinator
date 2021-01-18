import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import Schema from './Schema';
import Sheet from './Sheet';
import Task from './TaskEntity';

const slice = createSlice({
  name: 'schema',
  initialState: {
    selectedTask: undefined,
    selectedSheet: undefined,
    tasks: [],
  } as Schema,
  reducers: {
    schemaSelectTask: (state, action: PayloadAction<string>) => {
      state.selectedTask = action.payload;
    },
    schemaAddTask: (
      state,
      action: PayloadAction<Task> | PayloadAction<{ id: string }>
    ) => {
      state.tasks.push(action.payload.id);
    },
    schemaRemoveTask: (state, action: PayloadAction<{ id: string }>) => {
      const index = state.tasks.indexOf(action.payload.id);
      if (index > -1) {
        state.tasks.splice(index, 1);
      }
      state.selectedTask = undefined;
    },
    schemaRemoveAllTasks: (state) => {
      state.tasks = [];
      state.selectedTask = undefined;
    },
    schemaSetSelectedSheet: (state, action: PayloadAction<Sheet>) => {
      state.selectedSheet = action.payload;
    },
    schemaClearSelectedSheet: (state) => {
      state.selectedSheet = undefined;
    },
    schemaSetSelectedTask: (state, action: PayloadAction<string>) => {
      state.selectedTask = action.payload;
    },
    schemaClearSelectedTask: (state) => {
      state.selectedTask = undefined;
    },
  },
});

export const {
  schemaAddTask,
  schemaRemoveTask,
  schemaRemoveAllTasks,
  schemaSelectTask,
  schemaSetSelectedTask,
  schemaClearSelectedTask,
  schemaSetSelectedSheet,
  schemaClearSelectedSheet,
} = slice.actions;

export const selectSchemaTasks = (state) => state.schema.tasks;
export const selectSchemaSelected = (state) => state.schema.selected;
export const selectSchema = (state) => state.schema;

export default slice.reducer;
