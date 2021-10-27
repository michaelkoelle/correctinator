/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Annotation from './Annotation';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';

const adapter = createEntityAdapter<Annotation>();

const slice = createSlice({
  name: 'annotations',
  initialState: adapter.getInitialState(),
  reducers: {
    annotationsAddOne: adapter.addOne,
    annotationsAddMany: adapter.addMany,
    annotationsUpdateOne: adapter.updateOne,
    annotationsUpdateMany: adapter.updateMany,
    annotationsRemoveOne: adapter.removeOne,
    annotationsRemoveMany: adapter.removeMany,
    annotationsRemoveAll: adapter.removeAll,
    annotationsUpsertOne: adapter.upsertOne,
    annotationsUpsertMany: adapter.upsertMany,
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
