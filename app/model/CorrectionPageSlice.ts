import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CorrectionPageState {
  sheetId: string | undefined;
  index: number;
}

const correctionPageSlice = createSlice({
  name: 'correctionPage',
  initialState: { sheetId: undefined, index: 0 } as CorrectionPageState,
  reducers: {
    correctionPageSetIndex(state, action: PayloadAction<number>) {
      state.index = action.payload;
    },
    correctionPageSetSheetId(state, action: PayloadAction<string>) {
      state.sheetId = action.payload;
    },
  },
});

export const selectCorrectionPage = (state) => state.correctionPage;
export const {
  correctionPageSetIndex,
  correctionPageSetSheetId,
} = correctionPageSlice.actions;
export default correctionPageSlice.reducer;
