/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import Note from './Note';
import { correctionsImport, deleteEntities } from './CorrectionsSlice';

const adapter = createEntityAdapter<Note>({
  selectId: (sel) => sel.text,
  sortComparer: (a, b) => a.text.localeCompare(b.text),
});

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
    [correctionsImport.type]: (state, action) => {
      if (action.payload.notes !== undefined) {
        adapter.upsertMany(state, action.payload.notes);
      }
    },
    [deleteEntities.type]: (state, action) => {
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
} = adapter.getSelectors((state: any) => state.notes);

export default slice.reducer;
