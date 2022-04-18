/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import SheetEntity from '../model/SheetEntity';

const adapter = createEntityAdapter<SheetEntity>({
  selectId: (s) => s.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: 'sheets',
  initialState: adapter.getInitialState(),
  reducers: {
    sheetsAddOne: (state, action) => adapter.addOne(state, action.payload),
    sheetsAddMany: (state, action) => adapter.addMany(state, action.payload),
    sheetsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    sheetsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    sheetsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    sheetsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    sheetsRemoveAll: (state) => adapter.removeAll(state),
    sheetsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    sheetsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.sheets);
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  sheetsAddOne,
  sheetsAddMany,
  sheetsUpdateOne,
  sheetsUpdateMany,
  sheetsRemoveOne,
  sheetsRemoveMany,
  sheetsRemoveAll,
  sheetsUpsertOne,
  sheetsUpsertMany,
} = slice.actions;
export default slice.reducer;

export const {
  selectById: selectSheetById,
  selectIds: selectSheetIds,
  selectEntities: selectSheetEntities,
  selectAll: selectAllSheets,
  selectTotal: selectTotalSheets,
} = adapter.getSelectors(
  (state: { sheets: EntityState<SheetEntity> }) => state.sheets
);
