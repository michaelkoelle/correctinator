import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { correctionsImport, selectCorrectionById } from './CorrectionsSlice';
import { schemaAddTask, schemaRemoveTask } from './SchemaSlice';
import Task from './Task';

const adapter = createEntityAdapter<Task>();

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
    tasksAddOneSubtask: (
      state,
      action: PayloadAction<{ id: string | undefined; subTask: Task }>
    ) => {
      const { id, subTask } = action.payload;

      if (id) {
        const parent: Task | undefined = state.entities[id];
        if (parent) {
          adapter.addOne(state, action.payload.subTask);
          state.entities[id] = {
            id,
            name: parent.name,
            value: undefined,
            max: undefined,
            step: undefined,
            comment: undefined,
            tasks: [subTask.id, ...parent.tasks],
          };
        }
      }
    },
  },
  extraReducers: {
    [correctionsImport.type]: (state: any, action) => {
      adapter.upsertMany(state, action.payload.tasks);
    },
    [schemaAddTask.type]: (state: any, action) => {
      adapter.upsertOne(state, action.payload);
    },
    /*
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
  tasksAddOneSubtask,
} = slice.actions;
export default slice.reducer;

export const {
  selectById: selectTaskById,
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
  selectAll: selectAllTasks,
  selectTotal: selectTotalTasks,
} = adapter.getSelectors((state: { tasks: EntityState<Task> }) => state.tasks);
