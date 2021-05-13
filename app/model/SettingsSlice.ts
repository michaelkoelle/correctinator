import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from './Theme';

export interface SettingsState {
  autosave: boolean;
  theme: Theme;
  backup: boolean;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autosave: true,
    theme: Theme.SYSTEM,
    backup: true,
  } as SettingsState,
  reducers: {
    settingsSetAutosave(state, action: PayloadAction<boolean>) {
      state.autosave = action.payload;
    },
    settingsSetTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    settingsSetBackup(state, action: PayloadAction<boolean>) {
      state.backup = action.payload;
    },
  },
});
export const selectSettingsBackup = (state) => state.settings.backup;
export const selectSettingsAutosave = (state) => state.settings.autosave;
export const selectSettingsTheme = (state) => state.settings.theme;
export const selectSettings = (state) => state.settings;
export const {
  settingsSetAutosave,
  settingsSetTheme,
  settingsSetBackup,
} = settingsSlice.actions;
export default settingsSlice.reducer;
