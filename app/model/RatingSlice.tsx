/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { correctionsImport, deleteEntities } from './CorrectionsSlice';
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
    [deleteEntities.type]: (state, action) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  selectById: selectRatingById,
  selectIds: selectRatingIds,
  selectEntities: selectRatingEntities,
  selectAll: selectAllRatings,
  selectTotal: selectTotalRatings,
} = adapter.getSelectors((state: any) => state.ratings);

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
