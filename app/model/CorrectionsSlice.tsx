/* eslint-disable import/no-cycle */
import {
  createAction,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { denormalize } from 'normalizr';
import { selectAllEntities } from '../rootReducer';
import Correction from './Correction';
import CorrectionEntity from './CorrectionEntity';
import { CorrectionSchema } from './NormalizationSchema';

export const correctionsImport = createAction<unknown>('correctionsImport');
export const deleteEntities = createAction<void>('deleteEntities');

const adapter = createEntityAdapter<CorrectionEntity>();

const slice = createSlice({
  name: 'corrections',
  initialState: adapter.getInitialState(),
  reducers: {
    correctionsAddOne: adapter.addOne,
    correctionsAddMany: adapter.addMany,
    correctionsUpdateOne: adapter.updateOne,
    correctionsUpdateMany: adapter.updateMany,
    correctionsRemoveOne: adapter.removeOne,
    correctionsRemoveMany: adapter.removeMany,
    correctionsRemoveAll: adapter.removeAll,
    correctionsUpsertOne: adapter.upsertOne,
    correctionsUpsertMany: adapter.upsertMany,
  },
  extraReducers: {
    [correctionsImport.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.corrections);
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  correctionsAddOne,
  correctionsAddMany,
  correctionsUpdateOne,
  correctionsUpdateMany,
  correctionsRemoveOne,
  correctionsRemoveMany,
  correctionsRemoveAll,
  correctionsUpsertOne,
  correctionsUpsertMany,
} = slice.actions;

export const {
  selectById: selectCorrectionById,
  selectIds: selectCorrectionIds,
  selectEntities: selectCorrectionEntities,
  selectAll: selectAllCorrections,
  selectTotal: selectTotalCorrections,
} = adapter.getSelectors((state: any) => state.corrections);

export const selectCorrectionsBySheetId = (sheetId: string) => {
  return createSelector(selectAllCorrections, selectAllEntities, (c, e) =>
    c
      .map((corr: CorrectionEntity) => {
        return denormalize(corr, CorrectionSchema, e);
      })
      .filter((corr: Correction) => {
        return corr.submission && corr.submission.sheet
          ? corr.submission.sheet.id === sheetId
          : false;
      })
  );
};

export default slice.reducer;
