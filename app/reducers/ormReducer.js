import orm from "../orm";

export default function ormReducer(dbState, action) {
  const sess = orm.session(dbState);

  // Session-specific Models are available
  // as properties on the Session instance.
  const { SubmissionCorrection } = sess;

  switch (action.type) {
    case 'CREATE_SUBMISSION_CORRECTION':
      SubmissionCorrection.create(action.payload);
      break;
  }

  // the state property of Session always points to the current database.
  // Updates don't mutate the original state, so this reference is not
  // equal to `dbState` that was an argument to this reducer.
  return sess.state;
}
