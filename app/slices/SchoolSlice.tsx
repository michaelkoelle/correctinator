/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import School from '../model/School';

const adapter = createEntityAdapter<School>({
  selectId: (school) => school.id,
});

const slice = createSlice({
  name: 'schools',
  initialState: adapter.getInitialState(),
  reducers: {
    schoolsAddOne: (state, action) => adapter.addOne(state, action.payload),
    schoolsAddMany: (state, action) => adapter.addMany(state, action.payload),
    schoolsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    schoolsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    schoolsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    schoolsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    schoolsRemoveAll: (state) => adapter.removeAll(state),
    schoolsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    schoolsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.schools);
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  selectById: selectSchoolById,
  selectIds: selectSchoolIds,
  selectEntities: selectSchoolEntities,
  selectAll: selectAllSchools,
  selectTotal: selectTotalSchools,
} = adapter.getSelectors(
  (state: { schools: EntityState<School> }) => state.schools
);

export const {
  schoolsAddOne,
  schoolsAddMany,
  schoolsUpdateOne,
  schoolsUpdateMany,
  schoolsRemoveOne,
  schoolsRemoveMany,
  schoolsRemoveAll,
  schoolsUpsertOne,
  schoolsUpsertMany,
} = slice.actions;
export default slice.reducer;
