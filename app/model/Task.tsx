type Task = {
  id: string;
  name: string;
  step: number;
  max: number;
  tasks?: Task[];
};
export default Task;
