/* eslint-disable import/no-cycle */
import Corrector from './Corrector';
import Status from './Status';
import Location from './Location';
import Note from './Note';
import Annotation from './Annotation';
import Submission from './Submission';
import Rating from './Rating';

type Correction = {
  id: string;
  submission: Submission;
  ratings?: Rating[];
  corrector: Corrector;
  status: Status;
  location?: Location;
  note?: Note;
  annotation?: Annotation;
};

export default Correction;
