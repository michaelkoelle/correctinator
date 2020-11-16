import Comment from './Comment';

type Task = {
  id: string;
  name: string;
  value?: number;
  step?: number;
  max?: number;
  tasks: string[];
  comment?: Comment;
};
export default Task;
