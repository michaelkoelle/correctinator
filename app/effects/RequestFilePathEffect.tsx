import { ipcRenderer } from 'electron';
import { REQUEST_FILE_PATH } from '../constants/ipc';

const RequestFilePathEffect = () => {
  return () => {
    // Get file path
    ipcRenderer.send(REQUEST_FILE_PATH);
  };
};

export default RequestFilePathEffect;
