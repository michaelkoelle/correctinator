/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import SheetEntity from '../model/SheetEntity';

const adapter = createEntityAdapter<SheetEntity>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: 'sheets',
  initialState: adapter.getInitialState(),
  reducers: {
    sheetsAddOne: (state, action) => adapter.addOne(state, action),
    sheetsAddMany: (state, action) => adapter.addMany(state, action),
    sheetsUpdateOne: (state, action) => adapter.updateOne(state, action),
    sheetsUpdateMany: (state, action) => adapter.updateMany(state, action),
    sheetsRemoveOne: (state, action) => adapter.removeOne(state, action),
    sheetsRemoveMany: (state, action) => adapter.removeMany(state, action),
    sheetsRemoveAll: (state) => adapter.removeAll(state),
    sheetsUpsertOne: (state, action) => adapter.upsertOne(state, action),
    sheetsUpsertMany: (state, action) => adapter.upsertMany(state, action),
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
