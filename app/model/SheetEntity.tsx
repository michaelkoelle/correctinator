import ExamPart from './ExamPart';
import Weight from './Weight';

type SheetEntity = {
  id: string;
  name: string;
  type: string;
  tasks?: string[];
  maxValue: number;
  valueType: string;
  school: string;
  term: string;
  course: string;
  weight?: Weight;
  examPart?: ExamPart;
};
export default SheetEntity;
