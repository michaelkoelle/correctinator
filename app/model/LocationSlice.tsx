import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { correctionsImport } from './CorrectionsSlice';
import Location from './Location';

const adapter = createEntityAdapter<Location>({
  selectId: (location) => location.id,
});

const slice = createSlice({
  name: 'locations',
  initialState: adapter.getInitialState(),
  reducers: {
    locationsAddOne: adapter.addOne,
    locationsAddMany: adapter.addMany,
    locationsUpdateOne: adapter.updateOne,
    locationsUpdateMany: adapter.updateMany,
    locationsRemoveOne: adapter.removeOne,
    locationsRemoveMany: adapter.removeMany,
    locationsRemoveAll: adapter.removeAll,
    locationsUpsertOne: adapter.upsertOne,
    locationsUpsertMany: adapter.upsertMany,
  },
  extraReducers: {
    [correctionsImport.type]: (state, action) => {
      if (action.payload.locations !== undefined) {
        adapter.upsertMany(state, action.payload.locations);
      }
    },
  },
});

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
