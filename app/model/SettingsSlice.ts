import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from './Theme';

export interface SettingsState {
  autosave: boolean;
  theme: Theme;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autosave: true,
    theme: Theme.SYSTEM,
  } as SettingsState,
  reducers: {
    settingsSetAutosave(state, action: PayloadAction<boolean>) {
      state.autosave = action.payload;
    },
    settingsSetTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
  },
});

export const selectSettingsAutosave = (state) => state.settings.autosave;
export const selectSettingsTheme = (state) => state.settings.theme;
export const selectSettings = (state) => state.settings;
export const { settingsSetAutosave, settingsSetTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
