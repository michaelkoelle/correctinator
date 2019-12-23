// orm.js
import { ORM } from 'redux-orm';
import Comment from "./model/Comment";
import Corrector from "./model/Corrector";
import Exercise from "./model/Exercise";
import Lecture from "./model/Lecture";
import Rating from "./model/Rating";
import Submission from "./model/Submission";
import SubmissionCorrection from "./model/SubmissionCorrection";
import Task from "./model/Task";

const orm = new ORM({
  stateSelector: state => state.orm,
});
orm.register(Comment, Corrector, Exercise, Lecture, Rating, Submission, SubmissionCorrection, Task);

export default orm;
