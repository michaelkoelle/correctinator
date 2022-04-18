/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import Location from '../model/Location';

const adapter = createEntityAdapter<Location>({
  selectId: (location) => location.id,
});

const slice = createSlice({
  name: 'locations',
  initialState: adapter.getInitialState(),
  reducers: {
    locationsAddOne: (state, action) => adapter.addOne(state, action.payload),
    locationsAddMany: (state, action) => adapter.addMany(state, action.payload),
    locationsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    locationsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    locationsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    locationsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    locationsRemoveAll: (state) => adapter.removeAll(state),
    locationsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    locationsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      if (action.payload.locations !== undefined) {
        adapter.upsertMany(state, action.payload.locations);
      }
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  selectById: selectLocationById,
  selectIds: selectLocationIds,
  selectEntities: selectLocationEntities,
  selectAll: selectAllLocations,
  selectTotal: selectTotalLocations,
} = adapter.getSelectors(
  (state: { locations: EntityState<Location> }) => state.locations
);

export const {
  locationsAddOne,
  locationsAddMany,
  locationsUpdateOne,
  locationsUpdateMany,
  locationsRemoveOne,
  locationsRemoveMany,
  locationsRemoveAll,
  locationsUpsertOne,
  locationsUpsertMany,
} = slice.actions;
export default slice.reducer;
