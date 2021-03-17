import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkspaceState {
  path: string;
  recent: string[];
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    path: '',
    recent: [],
  } as WorkspaceState,
  reducers: {
    workspaceSetPath(state, action: PayloadAction<string>) {
      state.path = action.payload;
      const temp = state.recent ? state.recent : [];
      if (action.payload.length > 0) {
        temp.push(action.payload);
        const temp1 = [...new Set(temp)];
        state.recent = temp1.slice(Math.max(temp1.length - 5, 0));
      }
    },
    workspaceRemoveOnePath(state, action: PayloadAction<string>) {
      const index = state.recent.indexOf(action.payload);
      if (index > -1) {
        state.recent.splice(index, 1);
      }
    },
  },
});

export const selectWorkspacePath = (state) => state.workspace.path;
export const selectRecentPaths = (state) => state.workspace.recent;
export const {
  workspaceSetPath,
  workspaceRemoveOnePath,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
