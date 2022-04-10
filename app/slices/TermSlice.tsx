/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import Term from '../model/Term';

const adapter = createEntityAdapter<Term>({
  selectId: (term) => term.id,
});

const slice = createSlice({
  name: 'terms',
  initialState: adapter.getInitialState(),
  reducers: {
    termsAddOne: (state, action) => adapter.addOne(state, action),
    termsAddMany: (state, action) => adapter.addMany(state, action),
    termsUpdateOne: (state, action) => adapter.updateOne(state, action),
    termsUpdateMany: (state, action) => adapter.updateMany(state, action),
    termsRemoveOne: (state, action) => adapter.removeOne(state, action),
    termsRemoveMany: (state, action) => adapter.removeMany(state, action),
    termsRemoveAll: (state) => adapter.removeAll(state),
    termsUpsertOne: (state, action) => adapter.upsertOne(state, action),
    termsUpsertMany: (state, action) => adapter.upsertMany(state, action),
  },
  extraReducers: {
    [loadCorrections.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.terms);
    },
    [deleteEntities.type]: (state) => {
      adapter.removeAll(state);
    },
  },
});

export const {
  selectById: selectTermById,
  selectIds: selectTermIds,
  selectEntities: selectTermEntities,
  selectAll: selectAllTerms,
  selectTotal: selectTotalTerms,
} = adapter.getSelectors((state: { terms: EntityState<Term> }) => state.terms);

export const {
  termsAddOne,
  termsAddMany,
  termsUpdateOne,
  termsUpdateMany,
  termsRemoveOne,
  termsRemoveMany,
  termsRemoveAll,
  termsUpsertOne,
  termsUpsertMany,
} = slice.actions;
export default slice.reducer;
