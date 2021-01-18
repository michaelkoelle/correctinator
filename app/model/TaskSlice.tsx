import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { correctionsImport, selectCorrectionById } from './CorrectionsSlice';
import { schemaAddTask, schemaRemoveTask } from './SchemaSlice';
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
    [correctionsImport.type]: (state: any, action) => {
      if (action.payload.tasks !== undefined) {
        adapter.upsertMany(state, action.payload.tasks);
      }
    },
    [schemaAddTask.type]: (state: any, action) => {
      adapter.upsertOne(state, action.payload);
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

export const getTasksFromCorrectionId = (id) =>
  createSelector(
    (state: any) => selectCorrectionById(state, id),
    (state: any) => state.tasks.entities,
    (c: any, tasks: any) => c?.tasks.map((i: number) => tasks[i])
  );

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
} = adapter.getSelectors(
  (state: { tasks: EntityState<TaskEntity> }) => state.tasks
);
