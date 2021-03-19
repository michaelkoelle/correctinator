import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  autosave: boolean;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autosave: true,
  } as SettingsState,
  reducers: {
    settingsSetAutosave(state, action: PayloadAction<boolean>) {
      state.autosave = action.payload;
    },
  },
});

export const selectSettingsAutosave = (state) => state.settings.autosave;
export const selectSettings = (state) => state.settings;
export const { settingsSetAutosave } = settingsSlice.actions;
export default settingsSlice.reducer;
