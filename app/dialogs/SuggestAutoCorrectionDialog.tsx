import AutoCorrectionModal from '../modals/AutoCorrectionModal';
import SheetEntity from '../model/SheetEntity';

const SuggestAutoCorrectionDialog = (showModal, close, sheet: SheetEntity) => {
  return {
    title: 'Try auto correct single choice tasks?',
    text: `Do you want to try to auto correct the single choice tasks?`,
    onConfirm: () => {
      // close parent modal
      close();
      showModal(AutoCorrectionModal, { sheetId: sheet.id });
    },
  };
};

export default SuggestAutoCorrectionDialog;
