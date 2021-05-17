import { remote } from 'electron';
import createTheme from '../theme';

const SystemThemeUpdateEffect = (setCurrentTheme, theme) => {
  return () => {
    const setTheme = () => {
      // Does nothing but required for force reload
      setCurrentTheme(createTheme(theme));
    };
    remote.nativeTheme.on('updated', setTheme);
    return () => {
      remote.nativeTheme.removeListener('updated', setTheme);
    };
  };
};

export default SystemThemeUpdateEffect;
