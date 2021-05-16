/* eslint-disable no-empty */
import * as YAML from 'yaml';
import { schemaSetClipboard } from '../model/SchemaSlice';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import PasteFromClipboardDialog from '../dialogs/PasteFromClipboardDialog';

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

    if (text.trim() === YAML.stringify(entities).trim()) {
      dispatch(schemaSetClipboard(text));
    }

    if (
      text.trim().length === 0 ||
      text === clipboardOld ||
      text.trim() === YAML.stringify(entities).trim()
    ) {
      return;
    }
    try {
      const newEntities = YAML.parse(text);
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
