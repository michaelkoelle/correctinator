/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import CommentEntity from '../model/CommentEntity';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';

const adapter = createEntityAdapter<CommentEntity>();

const slice = createSlice({
  name: 'comments',
  initialState: adapter.getInitialState(),
  reducers: {
    commentsAddOne: (state, action) => adapter.addOne(state, action.payload),
    commentsAddMany: (state, action) => adapter.addMany(state, action.payload),
    commentsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    commentsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    commentsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    commentsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    commentsRemoveAll: (state) => adapter.removeAll(state),
    commentsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    commentsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      if (action.payload.comments !== undefined) {
        adapter.upsertMany(state, action.payload.comments);
      }
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  commentsAddOne,
  commentsAddMany,
  commentsUpdateOne,
  commentsUpdateMany,
  commentsRemoveOne,
  commentsRemoveMany,
  commentsRemoveAll,
  commentsUpsertOne,
  commentsUpsertMany,
} = slice.actions;

export const {
  selectById: selectCommentsById,
  selectIds: selectCommentsIds,
  selectEntities: selectCommentsEntities,
  selectAll: selectAllComments,
  selectTotal: selectTotalComments,
} = adapter.getSelectors(
  (state: { comments: EntityState<CommentEntity> }) => state.comments
);

export default slice.reducer;
