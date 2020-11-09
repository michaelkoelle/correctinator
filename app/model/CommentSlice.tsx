import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Comment from './Comment';
import { correctionsImport } from './CorrectionsSlice';

const adapter = createEntityAdapter<Comment>();

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
    [correctionsImport.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.comments);
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
  selectById: selectCorrectionById,
  selectIds: selectCorrectionIds,
  selectEntities: selectCorrectionEntities,
  selectAll: selectAllcomments,
  selectTotal: selectTotalcomments,
} = adapter.getSelectors(
  (state: { comments: EntityState<Comment> }) => state.comments
);

export default slice.reducer;
