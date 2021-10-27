/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Note from './Note';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';

const adapter = createEntityAdapter<Note>();

const slice = createSlice({
  name: 'notes',
  initialState: adapter.getInitialState(),
  reducers: {
    notesAddOne: adapter.addOne,
    notesAddMany: adapter.addMany,
    notesUpdateOne: adapter.updateOne,
    notesUpdateMany: adapter.updateMany,
    notesRemoveOne: adapter.removeOne,
    notesRemoveMany: adapter.removeMany,
    notesRemoveAll: adapter.removeAll,
    notesUpsertOne: adapter.upsertOne,
    notesUpsertMany: adapter.upsertMany,
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
