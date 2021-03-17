import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  autosave: boolean;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autosave: false,
  } as SettingsState,
  reducers: {
    settingsSetAutosave(state, action: PayloadAction<boolean>) {
      state.autosave = action.payload;
    },
  },
});

export const selectSettingsAutosave = (state) => state.settings.autosave;
export const { settingsSetAutosave } = settingsSlice.actions;
export default settingsSlice.reducer;
