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
    annotationsAddOne: (state, action) => adapter.addOne(state, action.payload),
    annotationsAddMany: (state, action) =>
      adapter.addMany(state, action.payload),
    annotationsUpdateOne: (state, action) =>
      adapter.updateOne(state, action.payload),
    annotationsUpdateMany: (state, action) =>
      adapter.updateMany(state, action.payload),
    annotationsRemoveOne: (state, action) =>
      adapter.removeOne(state, action.payload),
    annotationsRemoveMany: (state, action) =>
      adapter.removeMany(state, action.payload),
    annotationsRemoveAll: (state) => adapter.removeAll(state),
    annotationsUpsertOne: (state, action) =>
      adapter.upsertOne(state, action.payload),
    annotationsUpsertMany: (state, action) =>
      adapter.upsertMany(state, action.payload),
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
