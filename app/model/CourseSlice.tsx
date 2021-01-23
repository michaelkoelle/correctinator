import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { correctionsImport } from './CorrectionsSlice';
import Course from './Course';

const adapter = createEntityAdapter<Course>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: 'courses',
  initialState: adapter.getInitialState(),
  reducers: {
    coursesAddOne: adapter.addOne,
    coursesAddMany: adapter.addMany,
    coursesUpdateOne: adapter.updateOne,
    coursesUpdateMany: adapter.updateMany,
    coursesRemoveOne: adapter.removeOne,
    coursesRemoveMany: adapter.removeMany,
    coursesRemoveAll: adapter.removeAll,
    coursesUpsertOne: adapter.upsertOne,
    coursesUpsertMany: adapter.upsertMany,
  },
  extraReducers: {
    [correctionsImport.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.courses);
    },
  },
});

export const {
  selectById: selectCourseById,
  selectIds: selectCourseIds,
  selectEntities: selectCourseEntities,
  selectAll: selectAllCourses,
  selectTotal: selectTotalCourses,
} = adapter.getSelectors((state: any) => state.courses);

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
