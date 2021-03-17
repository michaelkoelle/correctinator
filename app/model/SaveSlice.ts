import { createSlice } from '@reduxjs/toolkit';
import { workspaceSetPath } from '../features/workspace/workspaceSlice';

export interface SaveState {
  unsavedChanges: boolean;
}

const saveSlice = createSlice({
  name: 'save',
  initialState: { unsavedChanges: false } as SaveState,
  reducers: {
    reportChange(state) {
      if (!state.unsavedChanges) {
        state.unsavedChanges = true;
      }
    },
    reportSaved(state) {
      if (state.unsavedChanges) {
        state.unsavedChanges = false;
      }
    },
  },
  extraReducers: {
    [workspaceSetPath.type]: (state) => {
      state.unsavedChanges = false;
    },
  },
});

export const selectUnsavedChanges = (state) => state.save.unsavedChanges;
export const { reportChange, reportSaved } = saveSlice.actions;
export default saveSlice.reducer;
