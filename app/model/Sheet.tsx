import Course from './Course';
import School from './School';
import Task from './Task';
import Term from './Term';

type Sheet = {
  id: string;
  name: string;
  type: string;
  tasks?: Task[];
  maxValue: number;
  valueType: string;
  school: School;
  term: Term;
  course: Course;
};

export default Sheet;
