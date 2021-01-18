/* eslint-disable import/no-cycle */
import Corrector from './Corrector';
import Status from './Status';
import Location from './Location';
import Note from './Note';
import Annotation from './Annotation';
import Submission from './Submission';

type Correction = {
  id: string;
  submission: Submission;
  corrector: Corrector;
  status: Status;
  location?: Location;
  note?: Note;
  annotation?: Annotation;
};

export default Correction;
