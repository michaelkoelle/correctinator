type TaskEntity = {
  id: string;
  name: string;
  step: number;
  max: number;
  tasks?: string[];
};
export default TaskEntity;
