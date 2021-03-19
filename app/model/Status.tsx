enum Status {
  Todo,
  Marked,
  Done,
}

export function statusToString(status: Status): string {
  switch (status) {
    case Status.Todo:
      return 'Todo';
    case Status.Marked:
      return 'Marked';
    case Status.Done:
      return 'Done';
    default:
      return 'Error';
  }
}

export default Status;
