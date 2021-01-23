import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { remote } from 'electron';
import * as Path from 'path';
/*
export interface WorkspaceState {
  path: string;
}
*/
function getDefaultWorkspaceDir(): string {
  const userDataPath: string = remote.app.getPath('userData');
  const subDir: string = Path.join(userDataPath, 'submissions');
  return subDir;
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: { path: getDefaultWorkspaceDir() },
  reducers: {
    workspaceSetPath(state, action: PayloadAction<string>) {
      state.path = action.payload;
    },
  },
});

export const selectWorkspacePath = (state) => state.workspace.path;
export const { workspaceSetPath } = workspaceSlice.actions;
export default workspaceSlice.reducer;
