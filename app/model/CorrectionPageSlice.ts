import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CorrectionPageState {
  sheetId: string | undefined;
  index: number;
  timeStart: string | undefined;
}

const correctionPageSlice = createSlice({
  name: 'correctionPage',
  initialState: {
    sheetId: undefined,
    index: 0,
    timeStart: undefined,
  } as CorrectionPageState,
  reducers: {
    correctionPageSetIndex(state, action: PayloadAction<number>) {
      state.index = action.payload;
    },
    correctionPageSetSheetId(state, action: PayloadAction<string | undefined>) {
      state.index = 0;
      state.sheetId = action.payload;
    },
    correctionPageSetTimeStart(state, action: PayloadAction<string>) {
      state.timeStart = action.payload;
    },
  },
});

export const selectCorrectionPage = (state) => state.correctionPage;
export const selectCorrectionPageTimeStart = (state) => {
  return state.correctionPage.timeStart
    ? new Date(state.correctionPage.timeStart)
    : undefined;
};
export const selectCorrectionPageIndex = (state) => state.correctionPage.index;
export const selectCorrectionPageSheetId = (state) =>
  state.correctionPage.sheetId;

export const {
  correctionPageSetIndex,
  correctionPageSetSheetId,
  correctionPageSetTimeStart,
} = correctionPageSlice.actions;
export default correctionPageSlice.reducer;
