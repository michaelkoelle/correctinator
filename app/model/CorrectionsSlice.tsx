/* eslint-disable import/no-cycle */
import {
  createAction,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import { normalize } from 'normalizr';
import Correction from './Correction';
import CorrectionEntity from './CorrectionEntity';
import { CorrectionsSchema } from './NormalizationSchema';

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

export function upsertCorrection(correction: Correction) {
  return (dispatch, getState) => {
    dispatch(
      correctionsImport(normalize([correction], CorrectionsSchema).entities)
    );
  };
}

export default slice.reducer;
