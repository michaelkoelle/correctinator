import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { workspaceSetPath } from '../features/workspace/workspaceSlice';
import { selectCorrectionsBySheetId } from './Selectors';

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
  extraReducers: {
    [workspaceSetPath.type]: (state) => {
      state.sheetId = undefined;
      state.index = 0;
      state.timeStart = undefined;
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

export function correctionPageSetIndexOfCorrection(correctionId: string) {
  return (dispatch, getState) => {
    const state = getState();
    const sheetId = selectCorrectionPageSheetId(state);
    const corrections = selectCorrectionsBySheetId(sheetId)(state);
    const index = corrections.findIndex((c) => c.id === correctionId);
    if (index !== undefined) {
      dispatch(correctionPageSetIndex(index));
    }
  };
}
