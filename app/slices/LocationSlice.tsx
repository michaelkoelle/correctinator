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
    locationsAddOne: (state, action) => adapter.addOne(state, action),
    locationsAddMany: (state, action) => adapter.addMany(state, action),
    locationsUpdateOne: (state, action) => adapter.updateOne(state, action),
    locationsUpdateMany: (state, action) => adapter.updateMany(state, action),
    locationsRemoveOne: (state, action) => adapter.removeOne(state, action),
    locationsRemoveMany: (state, action) => adapter.removeMany(state, action),
    locationsRemoveAll: (state) => adapter.removeAll(state),
    locationsUpsertOne: (state, action) => adapter.upsertOne(state, action),
    locationsUpsertMany: (state, action) => adapter.upsertMany(state, action),
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
