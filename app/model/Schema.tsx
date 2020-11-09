import Sheet from './Sheet';
import Task from './Task';

type Schema = {
  selectedTask: Task | undefined;
  selectedSheet: Sheet | undefined;
  tasks: string[];
};
export default Schema;
