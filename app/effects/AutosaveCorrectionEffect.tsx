import { saveCorrectionToWorkspace } from '../utils/FileAccess';

const AutosaveCorrectionEffect = (autosave, corr, workspace) => {
  const onSave = () => {
    if (corr && autosave) {
      saveCorrectionToWorkspace(corr, workspace);
    }
  };

  return () => {
    const id = setTimeout(onSave, 3000);
    return () => {
      clearTimeout(id);
    };
  };
};

export default AutosaveCorrectionEffect;
