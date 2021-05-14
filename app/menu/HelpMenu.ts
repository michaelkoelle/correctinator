import { MenuItemConstructorOptions, remote, shell } from 'electron';
import * as Path from 'path';

const buildHelpMenu = (
  setOpenUpdater,
  setOpenReleaseNotes,
  setVersionInfo
): MenuItemConstructorOptions => {
  return {
    label: 'Help',
    submenu: [
      {
        label: 'Check for Updates',
        async click() {
          setOpenUpdater(true);
        },
      },
      {
        label: 'View Release Notes',
        async click() {
          setOpenReleaseNotes(true);
          const info = await remote
            .require('electron-updater')
            .autoUpdater.checkForUpdates();
          if (info === undefined) {
            setOpenReleaseNotes(false);
          }
          setVersionInfo(info.versionInfo);
        },
      },
      { type: 'separator' },
      {
        label: 'Show Backups Folder',
        click: async () => {
          remote.shell.openPath(
            Path.join(remote.app.getPath('userData'), 'Backup')
          );
        },
      },
      { type: 'separator' },
      {
        label: 'Documentation',
        click() {
          shell.openExternal(
            'https://github.com/koellemichael/correctinator#readme'
          );
        },
      },
      {
        label: 'Search Issues',
        click() {
          shell.openExternal(
            'https://github.com/koellemichael/correctinator/issues'
          );
        },
      },
    ],
  };
};

export default buildHelpMenu;
