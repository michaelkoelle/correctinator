import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from './Theme';

export interface GeneralSettings {
  theme: Theme;
  autosave: boolean;
}

export interface BackupSettings {
  enabled: boolean;
}

export interface MediaViewerSettings {
  showFileName: boolean;
  cycleFiles: boolean;
}

export interface SettingsState {
  general: GeneralSettings;
  backup: BackupSettings;
  mediaViewer: MediaViewerSettings;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    general: {
      autosave: true,
      theme: Theme.SYSTEM,
    },
    backup: {
      enabled: true,
    },
    mediaViewer: {
      showFileName: true,
      cycleFiles: false,
    },
  } as SettingsState,
  reducers: {
    settingsSetGeneral(state, action: PayloadAction<GeneralSettings>) {
      state.general = action.payload;
    },
    settingsSetBackup(state, action: PayloadAction<BackupSettings>) {
      state.backup = action.payload;
    },
    settingsSetMediaViewer(state, action: PayloadAction<MediaViewerSettings>) {
      state.mediaViewer = action.payload;
    },
  },
});
export const selectSettingsGeneral = (state) => state.settings.general;
export const selectSettingsBackup = (state) => state.settings.backup;
export const selectSettingsMediaViewer = (state) => state.settings.mediaViewer;
export const selectSettings = (state) => state.settings;
export const {
  settingsSetGeneral,
  settingsSetBackup,
  settingsSetMediaViewer,
} = settingsSlice.actions;
export default settingsSlice.reducer;
