import { EffectCallback } from 'react';
import fs from 'fs';
import { workspaceSetPath } from '../features/workspace/workspaceSlice';
import { reloadState } from '../utils/FileAccess';

const WorkspaceEffect = (dispatch, workspacePath: string): EffectCallback => {
  return () => {
    const handleChange = (curr: fs.Stats, prev: fs.Stats) => {
      if (!curr.isFile() && prev.isFile()) {
        dispatch(workspaceSetPath(''));
        dispatch(reloadState());
      }
    };
    // Start watching
    fs.watchFile(workspacePath, handleChange);
    return () => {
      // Stop watching
      fs.unwatchFile(workspacePath, handleChange);
    };
  };
};

export default WorkspaceEffect;
