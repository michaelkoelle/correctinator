import Course from './Course';
import ExamPart from './ExamPart';
import School from './School';
import Task from './Task';
import Term from './Term';
import Weight from './Weight';

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
  weight?: Weight;
  examPart?: ExamPart;
};

export default Sheet;
