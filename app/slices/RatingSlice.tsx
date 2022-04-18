/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import RatingEntity from '../model/RatingEntity';

const adapter = createEntityAdapter<RatingEntity>({
  selectId: (rating) => rating.id,
});

const slice = createSlice({
  name: 'ratings',
  initialState: adapter.getInitialState(),
  reducers: {
    ratingsAddOne: (state, action) => adapter.addOne(state, action.payload),
    ratingsAddMany: (state, action) => adapter.addMany(state, action.payload),
    ratingsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    ratingsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    ratingsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    ratingsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    ratingsRemoveAll: (state) => adapter.removeAll(state),
    ratingsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    ratingsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      if (action.payload.ratings !== undefined) {
        adapter.upsertMany(state, action.payload.ratings);
      }
    },
    [deleteEntities.type]: (state) => {
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
} = adapter.getSelectors(
  (state: { ratings: EntityState<RatingEntity> }) => state.ratings
);

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
