import Corrector from './Corrector';
import Course from './Course';
import School from './School';
import Sheet from './Sheet';
import Status from './Status';
import Term from './Term';
import Location from './Location';
import Task from './Task';

type Correction = {
  submission: string;
  term: Term;
  school: School;
  course: Course;
  sheet: Sheet;
  corrector: Corrector;
  location: Location;
  tasks: Task[] | string[];
  status: Status;
};

export default Correction;
