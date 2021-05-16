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
  setOpenExportDialog,
  setExportSheetId,
  setReload,
  setOpenUpdater
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
      setOpenFileError,
      setOpenExportDialog,
      setExportSheetId
    ),
    buildViewMenu(dispatch, settings, setReload),
    buildHelpMenu(showModal, setOpenUpdater),
  ];
};

export default buildMenu;
