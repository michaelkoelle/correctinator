/* eslint-disable import/no-cycle */
import {
  createAction,
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { normalize } from 'normalizr';
import Correction from '../model/Correction';
import CorrectionEntity from '../model/CorrectionEntity';
import { CorrectionsSchema } from '../model/NormalizationSchema';

export const loadCorrections = createAction<unknown>('loadCorrections');
export const deleteEntities = createAction<void>('deleteEntities');

const adapter = createEntityAdapter<CorrectionEntity>();

const slice = createSlice({
  name: 'corrections',
  initialState: adapter.getInitialState(),
  reducers: {
    correctionsAddOne: (state, action) => adapter.addOne(state, action.payload),
    correctionsAddMany: (state, action) =>
      adapter.addMany(state, action.payload),
    correctionsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    correctionsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    correctionsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    correctionsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    correctionsRemoveAll: (state) => adapter.removeAll(state),
    correctionsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    correctionsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
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
} = adapter.getSelectors(
  (state: { corrections: EntityState<CorrectionEntity> }) => state.corrections
);

export function upsertCorrection(correction: Correction) {
  return (dispatch) => {
    dispatch(
      loadCorrections(normalize([correction], CorrectionsSchema).entities)
    );
  };
}

export default slice.reducer;
