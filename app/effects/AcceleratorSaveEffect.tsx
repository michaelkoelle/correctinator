import { save } from '../utils/FileAccess';

const AcceleratorSaveEffect = (dispatch) => {
  return () => {
    const acceleratorListener = (event) => {
      // Save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        dispatch(save());
      }
    };
    window.addEventListener('keydown', acceleratorListener, true);
    return () => {
      window.removeEventListener('keydown', acceleratorListener, true);
    };
  };
};

export default AcceleratorSaveEffect;
