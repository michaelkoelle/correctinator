const SkipUnreadFilesDialog = (onNext) => {
  return {
    title: 'Skip unread files?',
    text: `There are still unread files for this submission. Are you sure you want to go to the next submission?`,
    onConfirm: () => {
      onNext(true);
    },
  };
};

export default SkipUnreadFilesDialog;
