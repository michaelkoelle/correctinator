import buildFileMenu from './FileMenu';
import buildHelpMenu from './HelpMenu';
import buildViewMenu from './ViewMenu';

const buildMenu = (
  dispatch,
  showModal,
  workspace,
  settings,
  sheets,
  unsavedChanges,
  recentPaths,
  setOpenFileError,
  setReload
) => {
  return [
    buildFileMenu(
      dispatch,
      showModal,
      workspace,
      settings,
      sheets,
      unsavedChanges,
      recentPaths,
      setOpenFileError
    ),
    buildViewMenu(dispatch, settings, setReload),
    buildHelpMenu(showModal),
  ];
};

export default buildMenu;
