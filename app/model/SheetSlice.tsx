/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import SheetEntity from './SheetEntity';

const adapter = createEntityAdapter<SheetEntity>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: 'sheets',
  initialState: adapter.getInitialState(),
  reducers: {
    sheetsAddOne: adapter.addOne,
    sheetsAddMany: adapter.addMany,
    sheetsUpdateOne: adapter.updateOne,
    sheetsUpdateMany: adapter.updateMany,
    sheetsRemoveOne: adapter.removeOne,
    sheetsRemoveMany: adapter.removeMany,
    sheetsRemoveAll: adapter.removeAll,
    sheetsUpsertOne: adapter.upsertOne,
    sheetsUpsertMany: adapter.upsertMany,
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
