import Task from './Task';
import Comment from './Comment';

type Rating = { id: string; value: number; comment: Comment; task: Task };
export default Rating;
