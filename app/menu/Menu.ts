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
  setOpenUpdater,
  setOpenReleaseNotes,
  setVersionInfo
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
    buildHelpMenu(setOpenUpdater, setOpenReleaseNotes, setVersionInfo),
  ];
};

export default buildMenu;
