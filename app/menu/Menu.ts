import buildFileMenu from './FileMenu';
import buildHelpMenu from './HelpMenu';
import buildViewMenu from './ViewMenu';

const buildMenu = (
  dispatch,
  showModal,
  workspace,
  settings,
  sheets,
  unsavedChangesDialog,
  recentPaths,
  setOpenFileError,
  backupPaths,
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
      unsavedChangesDialog,
      recentPaths,
      setOpenFileError,
      backupPaths,
      setOpenExportDialog,
      setExportSheetId
    ),
    buildViewMenu(dispatch, settings, setReload),
    buildHelpMenu(setOpenUpdater, setOpenReleaseNotes, setVersionInfo),
  ];
};

export default buildMenu;
