import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OverviewState {
  sheetId: string | undefined;
}

const overviewSlice = createSlice({
  name: 'overview',
  initialState: {
    sheetId: undefined,
  } as OverviewState,
  reducers: {
    overviewSetSheetId(state, action: PayloadAction<string | undefined>) {
      state.sheetId = action.payload;
    },
    overviewClearSelectedSheetWithId: (
      state,
      action: PayloadAction<string>
    ) => {
      state.sheetId =
        action.payload === state.sheetId ? undefined : state.sheetId;
    },
  },
});

export const selectOverviewSheetId = (state) => state.overview.sheetId;

export const {
  overviewSetSheetId,
  overviewClearSelectedSheetWithId,
} = overviewSlice.actions;
export default overviewSlice.reducer;
