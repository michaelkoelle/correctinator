import Correction from './Correction';
import Corrector from './Corrector';
import Course from './Course';
import School from './School';
import Sheet from './Sheet';
import Term from './Term';
import Location from './Location';
import Task from './TaskEntity';

type ImportEntities = {
  terms: Term[];
  schools: School[];
  courses: Course[];
  sheets: Sheet[];
  correctors: Corrector[];
  locations: Location[];
  tasks: Task[];
  corrections: Correction[];
};

export default ImportEntities;
