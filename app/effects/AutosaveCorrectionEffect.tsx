import { saveCorrectionToWorkspace } from '../utils/FileAccess';

const AutosaveCorrectionEffect = (autosave, corr, workspace) => {
  return () => {
    return () => {
      if (corr && autosave) {
        saveCorrectionToWorkspace(corr, workspace);
      }
    };
  };
};

export default AutosaveCorrectionEffect;
