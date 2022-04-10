/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import Course from '../model/Course';

const adapter = createEntityAdapter<Course>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: 'courses',
  initialState: adapter.getInitialState(),
  reducers: {
    coursesAddOne: (state, action) => adapter.addOne(state, action),
    coursesAddMany: (state, action) => adapter.addMany(state, action),
    coursesUpdateOne: (state, action) => adapter.updateOne(state, action),
    coursesUpdateMany: (state, action) => adapter.updateMany(state, action),
    coursesRemoveOne: (state, action) => adapter.removeOne(state, action),
    coursesRemoveMany: (state, action) => adapter.removeMany(state, action),
    coursesRemoveAll: (state) => adapter.removeAll(state),
    coursesUpsertOne: (state, action) => adapter.upsertOne(state, action),
    coursesUpsertMany: (state, action) => adapter.upsertMany(state, action),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.courses);
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  selectById: selectCourseById,
  selectIds: selectCourseIds,
  selectEntities: selectCourseEntities,
  selectAll: selectAllCourses,
  selectTotal: selectTotalCourses,
} = adapter.getSelectors(
  (state: { courses: EntityState<Course> }) => state.courses
);

export const {
  coursesAddOne,
  coursesAddMany,
  coursesUpdateOne,
  coursesUpdateMany,
  coursesRemoveOne,
  coursesRemoveMany,
  coursesRemoveAll,
  coursesUpsertOne,
  coursesUpsertMany,
} = slice.actions;
export default slice.reducer;
