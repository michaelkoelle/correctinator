import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import LauncherTabs from './LauncherTabs';

export interface LauncherState {
  tabIndex: number;
}

const slice = createSlice({
  name: 'launcher',
  initialState: {
    tabIndex: LauncherTabs.PROJECTS,
    selectedFile: undefined,
  } as LauncherState,
  reducers: {
    launcherSetTabIndex: (state, action: PayloadAction<number>) => {
      state.tabIndex = action.payload;
    },
  },
});

export const { launcherSetTabIndex } = slice.actions;
export const selectLauncherState = (state): LauncherState => state.launcher;
export default slice.reducer;
