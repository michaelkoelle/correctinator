/* eslint-disable import/prefer-default-export */
import { schema } from 'normalizr';

export const TermSchema = new schema.Entity('terms');
export const SchoolSchema = new schema.Entity('schools');
export const CourseSchema = new schema.Entity('courses');
export const CorrectorSchema = new schema.Entity('correctors');
export const LocationSchema = new schema.Entity('locations');
export const NoteSchema = new schema.Entity('notes');
export const AnnotationSchema = new schema.Entity('annotations');
export const CommentSchema = new schema.Entity('comments');

export const TaskSchema = new schema.Entity('tasks');
export const TasksSchema = new schema.Array(TaskSchema);
TaskSchema.define({
  tasks: TasksSchema,
});

export const SheetSchema = new schema.Entity('sheets', {
  term: TermSchema,
  course: CourseSchema,
  school: SchoolSchema,
  tasks: TasksSchema,
});

export const SheetsSchema = new schema.Array(SheetSchema);

export const RatingSchema = new schema.Entity('ratings', {
  comment: CommentSchema,
  task: TaskSchema,
});

export const RatingsSchema = new schema.Array(RatingSchema);

export const CorrectionSchema = new schema.Entity('corrections');

export const SubmissionSchema = new schema.Entity(
  'submissions',
  {
    sheet: SheetSchema,
    correction: CorrectionSchema,
  },
  { idAttribute: 'id' }
);

export const SubmissionsSchema = new schema.Array(SubmissionSchema);

CorrectionSchema.define({
  location: LocationSchema,
  corrector: CorrectorSchema,
  note: NoteSchema,
  annotation: AnnotationSchema,
  ratings: RatingsSchema,
  submission: SubmissionSchema,
});

export const CorrectionsSchema = new schema.Array(CorrectionSchema);
