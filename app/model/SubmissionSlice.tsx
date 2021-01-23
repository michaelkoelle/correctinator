import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { correctionsImport } from './CorrectionsSlice';
import SubmissionEntity from './SubmissionEntity';

const adapter = createEntityAdapter<SubmissionEntity>();

const slice = createSlice({
  name: 'submissions',
  initialState: adapter.getInitialState(),
  reducers: {
    submissionsAddOne: adapter.addOne,
    submissionsAddMany: adapter.addMany,
    submissionsUpdateOne: adapter.updateOne,
    submissionsUpdateMany: adapter.updateMany,
    submissionsRemoveOne: adapter.removeOne,
    submissionsRemoveMany: adapter.removeMany,
    submissionsRemoveAll: adapter.removeAll,
    submissionsUpsertOne: adapter.upsertOne,
    submissionsUpsertMany: adapter.upsertMany,
  },
  extraReducers: {
    [correctionsImport.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.submissions);
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
} = adapter.getSelectors((state: any) => state.submissions);
