import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { correctionsImport } from './CorrectionsSlice';
import Corrector from './Corrector';

const adapter = createEntityAdapter<Corrector>({
  selectId: (corrector) => corrector.id,
});

const slice = createSlice({
  name: 'correctors',
  initialState: adapter.getInitialState(),
  reducers: {
    correctorsAddOne: adapter.addOne,
    correctorsAddMany: adapter.addMany,
    correctorsUpdateOne: adapter.updateOne,
    correctorsUpdateMany: adapter.updateMany,
    correctorsRemoveOne: adapter.removeOne,
    correctorsRemoveMany: adapter.removeMany,
    correctorsRemoveAll: adapter.removeAll,
    correctorsUpsertOne: adapter.upsertOne,
    correctorsUpsertMany: adapter.upsertMany,
  },
  extraReducers: {
    [correctionsImport.type]: (state, action) => {
      adapter.upsertMany(state, action.payload.correctors);
    },
  },
});

export const {
  selectById: selectCorrectorById,
  selectIds: selectCorrectorIds,
  selectEntities: selectCorrectorEntities,
  selectAll: selectAllCorrectors,
  selectTotal: selectTotalCorrectors,
} = adapter.getSelectors(
  (state: { correctors: EntityState<Corrector> }) => state.correctors
);

export const {
  correctorsAddOne,
  correctorsAddMany,
  correctorsUpdateOne,
  correctorsUpdateMany,
  correctorsRemoveOne,
  correctorsRemoveMany,
  correctorsRemoveAll,
  correctorsUpsertOne,
  correctorsUpsertMany,
} = slice.actions;
export default slice.reducer;
