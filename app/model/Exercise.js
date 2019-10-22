import {attr, fk} from "redux-orm";
import Task from './Task';

export default class Exercise extends Task {}
Exercise.modelName = 'Exercise';
Exercise.fields = {
  lectureId: fk("Lecture")
};
