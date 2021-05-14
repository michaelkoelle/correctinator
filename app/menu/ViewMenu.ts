import { MenuItemConstructorOptions, remote } from 'electron';
import { settingsSetTheme } from '../model/SettingsSlice';
import { Theme } from '../model/Theme';

const buildViewMenu = (
  dispatch,
  settings,
  setReload
): MenuItemConstructorOptions => {
  const currentWindow = remote.getCurrentWindow();
  return {
    label: 'View',
    submenu:
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? [
            {
              label: 'Reload',
              accelerator: 'Ctrl+R',
              click: () => {
                setReload(true);
                currentWindow.webContents.reload();
              },
            },
            {
              label: 'Toggle Full Screen',
              accelerator: 'F11',
              click: () => {
                currentWindow.setFullScreen(!currentWindow.isFullScreen());
              },
            },
            {
              label: 'Toggle Developer Tools',
              accelerator: 'Alt+Ctrl+I',
              click: () => {
                currentWindow.webContents.toggleDevTools();
              },
            },
            {
              label: 'Theme',
              submenu: [
                {
                  label: 'Dark',
                  type: 'checkbox',
                  checked: settings.theme === Theme.DARK,
                  click: () => {
                    dispatch(settingsSetTheme(Theme.DARK));
                  },
                },
                {
                  label: 'Light',
                  type: 'checkbox',
                  checked: settings.theme === Theme.LIGHT,
                  click: () => {
                    dispatch(settingsSetTheme(Theme.LIGHT));
                  },
                },
                {
                  label: 'System',
                  type: 'checkbox',
                  checked: settings.theme === Theme.SYSTEM,
                  click: () => {
                    dispatch(settingsSetTheme(Theme.SYSTEM));
                  },
                },
              ],
            },
          ]
        : [
            {
              label: 'Toggle Full Screen',
              accelerator: 'F11',
              click: () => {
                currentWindow.setFullScreen(!currentWindow.isFullScreen());
              },
            },
            {
              label: 'Theme',
              submenu: [
                {
                  label: 'Dark',
                  type: 'checkbox',
                  checked: settings.theme === Theme.DARK,
                  click: () => {
                    dispatch(settingsSetTheme(Theme.DARK));
                  },
                },
                {
                  label: 'Light',
                  type: 'checkbox',
                  checked: settings.theme === Theme.LIGHT,
                  click: () => {
                    dispatch(settingsSetTheme(Theme.LIGHT));
                  },
                },
                {
                  label: 'System',
                  type: 'checkbox',
                  checked: settings.theme === Theme.SYSTEM,
                  click: () => {
                    dispatch(settingsSetTheme(Theme.SYSTEM));
                  },
                },
              ],
            },
          ],
  };
};

export default buildViewMenu;
