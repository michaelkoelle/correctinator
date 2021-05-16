const OpenExportModalDialog = (onExport) => {
  return {
    title: 'Export Corrections?',
    text: `Seems like you are finished with the correction. Would you like to export the corrections?`,
    onConfirm: () => {
      onExport();
    },
  };
};

export default OpenExportModalDialog;
