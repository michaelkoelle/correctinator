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
    schoolsAddOne: (state, action) => adapter.addOne(state, action),
    schoolsAddMany: (state, action) => adapter.addMany(state, action),
    schoolsUpdateOne: (state, action) => adapter.updateOne(state, action),
    schoolsUpdateMany: (state, action) => adapter.updateMany(state, action),
    schoolsRemoveOne: (state, action) => adapter.removeOne(state, action),
    schoolsRemoveMany: (state, action) => adapter.removeMany(state, action),
    schoolsRemoveAll: (state) => adapter.removeAll(state),
    schoolsUpsertOne: (state, action) => adapter.upsertOne(state, action),
    schoolsUpsertMany: (state, action) => adapter.upsertMany(state, action),
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
