/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Note from '../model/Note';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';

const adapter = createEntityAdapter<Note>();

const slice = createSlice({
  name: 'notes',
  initialState: adapter.getInitialState(),
  reducers: {
    notesAddOne: (state, action) => adapter.addOne(state, action),
    notesAddMany: (state, action) => adapter.addMany(state, action),
    notesUpdateOne: (state, action) => adapter.updateOne(state, action),
    notesUpdateMany: (state, action) => adapter.updateMany(state, action),
    notesRemoveOne: (state, action) => adapter.removeOne(state, action),
    notesRemoveMany: (state, action) => adapter.removeMany(state, action),
    notesRemoveAll: (state) => adapter.removeAll(state),
    notesUpsertOne: (state, action) => adapter.upsertOne(state, action),
    notesUpsertMany: (state, action) => adapter.upsertMany(state, action),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      if (action.payload.notes !== undefined) {
        adapter.upsertMany(state, action.payload.notes);
      }
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  notesAddOne,
  notesAddMany,
  notesUpdateOne,
  notesUpdateMany,
  notesRemoveOne,
  notesRemoveMany,
  notesRemoveAll,
  notesUpsertOne,
  notesUpsertMany,
} = slice.actions;

export const {
  selectById: selectNoteById,
  selectIds: selectNoteIds,
  selectEntities: selectNoteEntities,
  selectAll: selectAllNotes,
  selectTotal: selectTotalNotes,
} = adapter.getSelectors((state: { notes: EntityState<Note> }) => state.notes);

export default slice.reducer;
