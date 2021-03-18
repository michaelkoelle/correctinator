/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import TaskEntity from './TaskEntity';

const adapter = createEntityAdapter<TaskEntity>();

const slice = createSlice({
  name: 'tasks',
  initialState: adapter.getInitialState(),
  reducers: {
    tasksAddOne: adapter.addOne,
    tasksAddMany: adapter.addMany,
    tasksUpdateOne: adapter.updateOne,
    tasksUpdateMany: adapter.updateMany,
    tasksRemoveOne: adapter.removeOne,
    tasksRemoveMany: adapter.removeMany,
    tasksRemoveAll: adapter.removeAll,
    tasksUpsertOne: adapter.upsertOne,
    tasksUpsertMany: adapter.upsertMany,
    tasksRemoveOneById: (state, action: PayloadAction<{ id: string }>) =>
      adapter.removeOne(state, action.payload.id),
    /* tasksAddOneSubtask: (
      state,
      action: PayloadAction<{ id: string | undefined; subTask: TaskEntity }>
    ) => {
      const { id, subTask } = action.payload;

      if (id) {
        const parent: TaskEntity | undefined = state.entities[id];
        if (parent) {
          adapter.addOne(state, action.payload.subTask);
          state.entities[id] = {
            id,
            name: parent.name,
            max: undefined,
            step: undefined,
            tasks: [subTask.id, ...parent.tasks],
          };
        }
      }
    }, */
  },
  extraReducers: {
    [loadCorrections.type]: (state: any, action) => {
      if (action.payload.tasks !== undefined) {
        adapter.upsertMany(state, action.payload.tasks);
      }
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
    /*
    TODO:
    [schemaRemoveTask.type]: (state: any, action) => {

      const parent = state.ids
        .map((id) => state.entities[id])
        .find((t) => t.tasks.includes(action.payload.id));
      console.log(state.ids);
      const { tasks } = state.entities[parent];

      const index = tasks.findIndex((t) => t.id === action.payload.id);

      if (index > -1) {
        tasks.splice(index, 1);

        adapter.updateOne(state, {
          id: parent.id,
          changes: { tasks },
        });
      }
      adapter.removeOne(state, action.payload.id);
    },

    [schemaRemoveTask.type]: (state: any, action) => {
      adapter.removeOne(state, action.payload.id);
    },
    */
  },
});

export const {
  tasksAddOne,
  tasksAddMany,
  tasksUpdateOne,
  tasksUpdateMany,
  tasksRemoveOne,
  tasksRemoveMany,
  tasksRemoveAll,
  tasksUpsertOne,
  tasksUpsertMany,
  // tasksAddOneSubtask,
  tasksRemoveOneById,
} = slice.actions;
export default slice.reducer;

export const {
  selectById: selectTaskById,
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
  selectAll: selectAllTasks,
  selectTotal: selectTotalTasks,
} = adapter.getSelectors((state: any) => state.tasks);
