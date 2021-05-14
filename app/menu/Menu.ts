import buildFileMenu from './FileMenu';
import buildHelpMenu from './HelpMenu';
import buildViewMenu from './ViewMenu';

const buildMenu = (
  dispatch,
  settings,
  sheets,
  unsavedChangesDialog,
  recentPaths,
  setOpenFileError,
  backupPaths,
  setBackupPath,
  setOpenRestoreBackupDialog,
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
      settings,
      sheets,
      unsavedChangesDialog,
      recentPaths,
      setOpenFileError,
      backupPaths,
      setBackupPath,
      setOpenRestoreBackupDialog,
      setOpenExportDialog,
      setExportSheetId
    ),
    buildViewMenu(dispatch, settings, setReload),
    buildHelpMenu(setOpenUpdater, setOpenReleaseNotes, setVersionInfo),
  ];
};

export default buildMenu;
