import Sheet from './Sheet';

type Schema = {
  selectedTask: string | undefined;
  selectedSheet: Sheet | undefined;
  tasks: string[];
};
export default Schema;
