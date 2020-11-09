import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { correctionsImport } from './CorrectionsSlice';
import School from './School';

const adapter = createEntityAdapter<School>({
  selectId: (sel) => sel.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: 'schools',
  initialState: adapter.getInitialState(),
  reducers: {
    schoolsAddOne: adapter.addOne,
    schoolsAddMany: adapter.addMany,
    schoolsUpdateOne: adapter.updateOne,
    schoolsUpdateMany: adapter.updateMany,
    schoolsRemoveOne: adapter.removeOne,
    schoolsRemoveMany: adapter.removeMany,
    schoolsRemoveAll: adapter.removeAll,
    schoolsUpsertOne: adapter.upsertOne,
    schoolsUpsertMany: adapter.upsertMany,
  },
  extraReducers: {
    [correctionsImport.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.schools);
    },
  },
});

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
