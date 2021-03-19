/* eslint-disable import/no-cycle */
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import CommentEntity from './CommentEntity';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';

const adapter = createEntityAdapter<CommentEntity>();

const slice = createSlice({
  name: 'comments',
  initialState: adapter.getInitialState(),
  reducers: {
    commentsAddOne: adapter.addOne,
    commentsAddMany: adapter.addMany,
    commentsUpdateOne: adapter.updateOne,
    commentsUpdateMany: adapter.updateMany,
    commentsRemoveOne: adapter.removeOne,
    commentsRemoveMany: adapter.removeMany,
    commentsRemoveAll: adapter.removeAll,
    commentsUpsertOne: adapter.upsertOne,
    commentsUpsertMany: adapter.upsertMany,
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
} = adapter.getSelectors((state: any) => state.comments);

export default slice.reducer;
