import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { correctionsImport } from './CorrectionsSlice';
import RatingEntity from './RatingEntity';

const adapter = createEntityAdapter<RatingEntity>({
  selectId: (rating) => rating.id,
});

const slice = createSlice({
  name: 'ratings',
  initialState: adapter.getInitialState(),
  reducers: {
    ratingsAddOne: adapter.addOne,
    ratingsAddMany: adapter.addMany,
    ratingsUpdateOne: adapter.updateOne,
    ratingsUpdateMany: adapter.updateMany,
    ratingsRemoveOne: adapter.removeOne,
    ratingsRemoveMany: adapter.removeMany,
    ratingsRemoveAll: adapter.removeAll,
    ratingsUpsertOne: adapter.upsertOne,
    ratingsUpsertMany: adapter.upsertMany,
  },
  extraReducers: {
    [correctionsImport.type]: (state, action) => {
      if (action.payload.ratings !== undefined) {
        adapter.upsertMany(state, action.payload.ratings);
      }
    },
  },
});

export const {
  ratingsAddOne,
  ratingsAddMany,
  ratingsUpdateOne,
  ratingsUpdateMany,
  ratingsRemoveOne,
  ratingsRemoveMany,
  ratingsRemoveAll,
  ratingsUpsertOne,
  ratingsUpsertMany,
} = slice.actions;
export default slice.reducer;
