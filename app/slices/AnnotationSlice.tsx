/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Annotation from '../model/Annotation';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';

const adapter = createEntityAdapter<Annotation>();

const slice = createSlice({
  name: 'annotations',
  initialState: adapter.getInitialState(),
  reducers: {
    annotationsAddOne: (state, action) => adapter.addOne(state, action),
    annotationsAddMany: (state, action) => adapter.addMany(state, action),
    annotationsUpdateOne: (state, action) => adapter.updateOne(state, action),
    annotationsUpdateMany: (state, action) => adapter.updateMany(state, action),
    annotationsRemoveOne: (state, action) => adapter.removeOne(state, action),
    annotationsRemoveMany: (state, action) => adapter.removeMany(state, action),
    annotationsRemoveAll: (state) => adapter.removeAll(state),
    annotationsUpsertOne: (state, action) => adapter.upsertOne(state, action),
    annotationsUpsertMany: (state, action) => adapter.upsertMany(state, action),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      if (action.payload.annotations !== undefined) {
        adapter.upsertMany(state, action.payload.annotations);
      }
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  annotationsAddOne,
  annotationsAddMany,
  annotationsUpdateOne,
  annotationsUpdateMany,
  annotationsRemoveOne,
  annotationsRemoveMany,
  annotationsRemoveAll,
  annotationsUpsertOne,
  annotationsUpsertMany,
} = slice.actions;

export const {
  selectById: selectAnnotationById,
  selectIds: selectAnnotationIds,
  selectEntities: selectAnnotationEntities,
  selectAll: selectAllAnnotations,
  selectTotal: selectTotalAnnotations,
} = adapter.getSelectors(
  (state: { annotations: EntityState<Annotation> }) => state.annotations
);

export default slice.reducer;
