import { schema } from 'normalizr';

export const commentSchema = new schema.Entity('comments');
export const lectureSchema = new schema.Entity('lectures');
export const correctorSchema = new schema.Entity('correctors');

export const taskSchema = new schema.Entity('tasks');
const tasks = new schema.Array(taskSchema);
taskSchema.define({ subTasks: tasks });
taskSchema.define({ parent: taskSchema });


export const exerciseSchema = new schema.Entity('exercises',{
  lecture: lectureSchema
});
exerciseSchema.define({ subTasks: tasks });
exerciseSchema.define({ parent: taskSchema });


export const submissionSchema = new schema.Entity('submissions', {
  exercise: exerciseSchema
});


export const ratingSchema = new schema.Entity('ratings',{
  comment: commentSchema,
  task: taskSchema,
  corrector: correctorSchema,
  submission: submissionSchema
});

export const submissionCorrectionSchema = new schema.Entity('submissionCorrections',{
  exercise: exerciseSchema,
  ratings: new schema.Array(ratingSchema)
});

export const stateSchema = new schema.Array(submissionCorrectionSchema);




