import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Project from './Project';

const adapter = createEntityAdapter<Project>();

const slice = createSlice({
  name: 'projects',
  initialState: adapter.getInitialState(),
  reducers: {
    projectsAddOne: adapter.addOne,
    projectsAddMany: adapter.addMany,
    projectsUpdateOne: adapter.updateOne,
    projectsUpdateMany: adapter.updateMany,
    projectsRemoveOne: adapter.removeOne,
    projectsRemoveMany: adapter.removeMany,
    projectsRemoveAll: adapter.removeAll,
    projectsUpsertOne: adapter.upsertOne,
    projectsUpsertMany: adapter.upsertMany,
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
