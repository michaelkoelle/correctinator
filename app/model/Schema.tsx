import CommentEntity from './CommentEntity';
import RatingEntity from './RatingEntity';
import TaskEntity from './TaskEntity';

type Schema = {
  selectedTaskId: string | undefined;
  selectedSheetId: string | undefined;
  tasks: TaskEntity[];
  ratings: RatingEntity[];
  comments: CommentEntity[];
};
export default Schema;
