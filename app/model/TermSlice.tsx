/* eslint-disable import/no-cycle */
import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { loadCorrections, deleteEntities } from './CorrectionsSlice';
import Term from './Term';

const adapter = createEntityAdapter<Term>({
  selectId: (term) => term.id,
});

const slice = createSlice({
  name: 'terms',
  initialState: adapter.getInitialState(),
  reducers: {
    termsAddOne: adapter.addOne,
    termsAddMany: adapter.addMany,
    termsUpdateOne: adapter.updateOne,
    termsUpdateMany: adapter.updateMany,
    termsRemoveOne: adapter.removeOne,
    termsRemoveMany: adapter.removeMany,
    termsRemoveAll: adapter.removeAll,
    termsUpsertOne: adapter.upsertOne,
    termsUpsertMany: adapter.upsertMany,
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
