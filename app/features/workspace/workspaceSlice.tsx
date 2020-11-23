import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { remote } from 'electron';
import * as Path from 'path';

export interface WorkspaceState {
  path: string;
}

function getDefaultWorkspaceDir(): string {
  const userDataPath: string = remote.app.getPath('userData');
  const subDir: string = Path.join(userDataPath, 'submissions');
  return subDir;
}

const initialState: WorkspaceState = { path: getDefaultWorkspaceDir() };

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    workspaceSetPath(state, action: PayloadAction<string>) {
      state.path = action.payload;
    },
  },
});

export const workspacePathSelector = (state: WorkspaceState) => state.path;
export const { workspaceSetPath } = workspaceSlice.actions;
export default workspaceSlice.reducer;
