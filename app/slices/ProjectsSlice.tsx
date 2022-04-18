import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Project from '../model/Project';

const adapter = createEntityAdapter<Project>();

const slice = createSlice({
  name: 'projects',
  initialState: adapter.getInitialState(),
  reducers: {
    projectsAddOne: (state, action) => adapter.addOne(state, action.payload),
    projectsAddMany: (state, action) => adapter.addMany(state, action.payload),
    projectsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    projectsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    projectsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    projectsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    projectsRemoveAll: (state) => adapter.removeAll(state),
    projectsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    projectsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
  },
});

export const {
  projectsAddOne,
  projectsAddMany,
  projectsUpdateOne,
  projectsUpdateMany,
  projectsRemoveOne,
  projectsRemoveMany,
  projectsRemoveAll,
  projectsUpsertOne,
  projectsUpsertMany,
} = slice.actions;

export const {
  selectById: selectProjectById,
  selectIds: selectProjectIds,
  selectEntities: selectProjectEntities,
  selectAll: selectAllProjects,
  selectTotal: selectTotalProjects,
} = adapter.getSelectors(
  (state: { projects: EntityState<Project> }) => state.projects
);

export default slice.reducer;
