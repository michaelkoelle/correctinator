import { MenuItemConstructorOptions, shell } from 'electron';
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
