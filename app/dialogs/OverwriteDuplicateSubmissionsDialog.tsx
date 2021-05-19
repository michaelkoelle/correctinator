import { ImportConflicts } from '../importer';
// eslint-disable-next-line import/no-cycle
import ImportModal from '../modals/ImportModal';

const OverwriteDuplicateSubmissionsDialog = (
  showModal,
  conflicts: ImportConflicts
) => {
  return {
    title: `${conflicts.files.length} duplicate submissions found!`,
    text: `Are you sure you want to overwrite ${conflicts.files.length} submissions? This will erase the correction progress of the submissions. This cannot be undone!`,
    onConfirm: () => {
      showModal(ImportModal, { conflicts });
    },
  };
};

export default OverwriteDuplicateSubmissionsDialog;
