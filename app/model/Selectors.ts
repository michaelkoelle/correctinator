import { createSelector, EntityId } from '@reduxjs/toolkit';
import { denormalize } from 'normalizr';
import Correction from './Correction';
import CorrectionEntity from './CorrectionEntity';
import { selectAllCorrections, selectCorrectionById } from './CorrectionsSlice';
import {
  CorrectionSchema,
  CorrectionsSchema,
  SheetsSchema,
} from './NormalizationSchema';
import Sheet from './Sheet';
import SheetEntity from './SheetEntity';
import { selectAllSheets, selectSheetIds } from './SheetSlice';

export const selectAllEntities = createSelector(
  [
    (state: any) => state.annotations.entities,
    (state: any) => state.comments.entities,
    (state: any) => state.corrections.entities,
    (state: any) => state.correctors.entities,
    (state: any) => state.courses.entities,
    (state: any) => state.locations.entities,
    (state: any) => state.notes.entities,
    (state: any) => state.ratings.entities,
    (state: any) => state.schools.entities,
    (state: any) => state.sheets.entities,
    (state: any) => state.submissions.entities,
    (state: any) => state.tasks.entities,
    (state: any) => state.terms.entities,
  ],
  (
    annotations,
    comments,
    corrections,
    correctors,
    courses,
    locations,
    notes,
    ratings,
    schools,
    sheets,
    submissions,
    tasks,
    terms
  ) => {
    return {
      annotations,
      comments,
      corrections,
      correctors,
      courses,
      locations,
      notes,
      ratings,
      schools,
      sheets,
      submissions,
      tasks,
      terms,
    };
  }
);

export const getTasksFromCorrectionId = (id) =>
  createSelector(
    (state: any) => selectCorrectionById(state, id),
    (state: any) => state.tasks.entities,
    (c: any, tasks: any) => c?.tasks.map((i: number) => tasks[i])
  );

export const selectEntitiesForSheet = createSelector(
  [
    (state: any) => state.courses.entities,
    (state: any) => state.schools.entities,
    (state: any) => state.sheets.entities,
    (state: any) => state.tasks.entities,
    (state: any) => state.terms.entities,
  ],
  (courses, schools, sheets, tasks, terms) => {
    return {
      courses,
      schools,
      sheets,
      tasks,
      terms,
    };
  }
);

export const selectAllSheetsDenormalized = createSelector(
  selectSheetIds,
  selectEntitiesForSheet,
  (s: EntityId[], e): Sheet[] => denormalize(s, SheetsSchema, e) as Sheet[]
);

export const selectCorrectionsBySheetId = (sheetId: string | undefined) => {
  return createSelector(selectAllCorrections, selectAllEntities, (c, e) =>
    c
      .map((corr: CorrectionEntity) => {
        return denormalize(corr, CorrectionSchema, e);
      })
      .filter((corr: Correction) => {
        return corr.submission && corr.submission.sheet
          ? corr.submission.sheet.id === sheetId
          : false;
      })
  );
};

export const selectAllCorrectionsDenormalized = createSelector(
  selectAllCorrections,
  selectAllEntities,
  (c, e) => denormalize(c, CorrectionsSchema, e)
);

export const selectCorrectionByIdDenormalized = (id: string) => {
  return createSelector(selectAllEntities, (e) =>
    denormalize(id, CorrectionSchema, e)
  );
};
