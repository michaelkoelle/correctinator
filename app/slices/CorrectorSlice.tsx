/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import Corrector from '../model/Corrector';

const adapter = createEntityAdapter<Corrector>({
  selectId: (corrector) => corrector.id,
});

const slice = createSlice({
  name: 'correctors',
  initialState: adapter.getInitialState(),
  reducers: {
    correctorsAddOne: (state, action) => adapter.addOne(state, action),
    correctorsAddMany: (state, action) => adapter.addMany(state, action),
    correctorsUpdateOne: (state, action) => adapter.updateOne(state, action),
    correctorsUpdateMany: (state, action) => adapter.updateMany(state, action),
    correctorsRemoveOne: (state, action) => adapter.removeOne(state, action),
    correctorsRemoveMany: (state, action) => adapter.removeMany(state, action),
    correctorsRemoveAll: (state) => adapter.removeAll(state),
    correctorsUpsertOne: (state, action) => adapter.upsertOne(state, action),
    correctorsUpsertMany: (state, action) => adapter.upsertMany(state, action),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.correctors);
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  selectById: selectCorrectorById,
  selectIds: selectCorrectorIds,
  selectEntities: selectCorrectorEntities,
  selectAll: selectAllCorrectors,
  selectTotal: selectTotalCorrectors,
} = adapter.getSelectors(
  (state: { correctors: EntityState<Corrector> }) => state.correctors
);

export const {
  correctorsAddOne,
  correctorsAddMany,
  correctorsUpdateOne,
  correctorsUpdateMany,
  correctorsRemoveOne,
  correctorsRemoveMany,
  correctorsRemoveAll,
  correctorsUpsertOne,
  correctorsUpsertMany,
} = slice.actions;
export default slice.reducer;
