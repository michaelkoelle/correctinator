/* eslint-disable no-empty */
import { schemaSetClipboard } from '../model/SchemaSlice';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import PasteFromClipboardDialog from '../dialogs/PasteFromClipboardDialog';
import { parseSchemaTasks } from '../utils/SchemaUtil';

const CheckClipboardEffect = (
  dispatch,
  showModal,
  clipboard,
  sheets,
  clipboardOld,
  skipCheck,
  setSkipCheck,
  entities
) => {
  function checkClipboard() {
    const text = clipboard.readText();
    // TODO: schauen ob gleich sind bis auf ids
    if (text.trim().length === 0 || text === clipboardOld) {
      return;
    }

    dispatch(schemaSetClipboard(text));

    try {
      const newEntities = parseSchemaTasks(JSON.parse(text));
      if (newEntities.tasks && newEntities.ratings && newEntities.comments) {
        dispatch(schemaSetClipboard(text));
        if (!skipCheck) {
          showModal(
            ConfirmationDialog,
            PasteFromClipboardDialog(clipboard, sheets)
          );
        } else {
          setSkipCheck(false);
        }
      }
    } catch (error) {}
  }

  return () => {
    const id = setInterval(() => checkClipboard(), 1000);
    return () => {
      clearInterval(id);
    };
  };
};

export default CheckClipboardEffect;
