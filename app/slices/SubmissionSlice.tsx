/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import SubmissionEntity from '../model/SubmissionEntity';

const adapter = createEntityAdapter<SubmissionEntity>();

const slice = createSlice({
  name: 'submissions',
  initialState: adapter.getInitialState(),
  reducers: {
    submissionsAddOne: (state, action) => adapter.addOne(state, action),
    submissionsAddMany: (state, action) => adapter.addMany(state, action),
    submissionsUpdateOne: (state, action) => adapter.updateOne(state, action),
    submissionsUpdateMany: (state, action) => adapter.updateMany(state, action),
    submissionsRemoveOne: (state, action) => adapter.removeOne(state, action),
    submissionsRemoveMany: (state, action) => adapter.removeMany(state, action),
    submissionsRemoveAll: (state) => adapter.removeAll(state),
    submissionsUpsertOne: (state, action) => adapter.upsertOne(state, action),
    submissionsUpsertMany: (state, action) => adapter.upsertMany(state, action),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.submissions);
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  submissionsAddOne,
  submissionsAddMany,
  submissionsUpdateOne,
  submissionsUpdateMany,
  submissionsRemoveOne,
  submissionsRemoveMany,
  submissionsRemoveAll,
  submissionsUpsertOne,
  submissionsUpsertMany,
} = slice.actions;
export default slice.reducer;

export const {
  selectById: selectSubmissionById,
  selectIds: selectSubmissionIds,
  selectEntities: selectSubmissionEntities,
  selectAll: selectAllSubmissions,
  selectTotal: selectTotalSubmissions,
} = adapter.getSelectors(
  (state: { submissions: EntityState<SubmissionEntity> }) => state.submissions
);
