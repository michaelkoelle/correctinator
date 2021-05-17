import { MenuItemConstructorOptions, remote, shell } from 'electron';
import * as Path from 'path';
import ReleaseNotesModal from '../modals/ReleaseNotesModal';
import UpdaterModal from '../modals/UpdaterModal';

const buildHelpMenu = (showModal): MenuItemConstructorOptions => {
  return {
    label: 'Help',
    submenu: [
      {
        label: 'Check for Updates',
        async click() {
          showModal(UpdaterModal, { showNotAvailiable: true });
        },
      },
      {
        label: 'Release Notes',
        async click() {
          showModal(ReleaseNotesModal);
        },
      },
      { type: 'separator' },
      {
        label: 'Backups Folder',
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
