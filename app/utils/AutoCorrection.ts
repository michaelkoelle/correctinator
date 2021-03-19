import fs from 'fs';
import * as Path from 'path';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import RatingEntity from '../model/RatingEntity';
import { ratingsUpdateMany } from '../model/RatingSlice';
import SingleChoiceTask from '../model/SingleChoiceTask';
import { getRateableTasksFromIds, isSingleChoiceTask } from './TaskUtil';
import SheetEntity from '../model/SheetEntity';
import CorrectionEntity from '../model/CorrectionEntity';
import { correctionsUpdateOne } from '../model/CorrectionsSlice';
import Status from '../model/Status';
import { loadFilesFromWorkspace } from './FileAccess';

enum SolutionsStatus {
  NO_OCCURENCE,
  SINGLE_OCCURENCE,
  MULTIPLE_OCCURENCES,
}

type NoSolutionFound = {
  status: SolutionsStatus.NO_OCCURENCE;
};

type SingleSolutionFound = {
  status: SolutionsStatus.SINGLE_OCCURENCE;
  text: string;
};

type MultipleSolutionsFound = {
  status: SolutionsStatus.MULTIPLE_OCCURENCES;
  texts: string[];
};

type Solution = SingleSolutionFound | MultipleSolutionsFound | NoSolutionFound;

export function extractStudentSolution(
  texts: string[],
  task: SingleChoiceTask
): Solution {
  // Extracts <taskName>[)|:|=][i|v]
  const re = new RegExp(
    `\\b(${task.name})[ |\\t]*?[)|）|:|=|.|-|>]{1,3}[ |\\t]*[(|（|\\[]?[ |\\t]*([i|v]+)`,
    'gim'
  );

  const solutions: string[] = [];
  texts.forEach((text) => {
    const matches = text.matchAll(re);
    Array.from(matches).forEach((match) => {
      if (match && match.length === 3) {
        const [, , solutionText] = match;
        solutions.push(solutionText);
      }
    });
  });

  const solution = solutions.length >= 0 ? solutions[0] : undefined;

  if (solutions.length === 1 && solution !== undefined) {
    return {
      status: SolutionsStatus.SINGLE_OCCURENCE,
      text: solution,
    };
  }

  if (solutions.length > 1) {
    return {
      status: SolutionsStatus.MULTIPLE_OCCURENCES,
      texts: solutions,
    };
  }

  return { status: SolutionsStatus.NO_OCCURENCE };
}

export function determineValue(
  task: SingleChoiceTask,
  solution: string
): number {
  return solution.toLowerCase().trim() === task.answer.text.toLowerCase().trim()
    ? task.answer.value
    : 0;
}

export function autoCorrection(
  tasks: SingleChoiceTask[],
  texts: string[],
  ratingIds: string[]
) {
  return (dispatch, getState) => {
    const state = getState();
    const ratings: RatingEntity[] = ratingIds.map(
      (id) => state.ratings.entities[id]
    );
    const correctedRatings: { ratingId: string; value: number }[] = [];
    const potentialMissing: { ratingId: string; solution: Solution }[] = [];

    tasks.forEach((t) => {
      const solution: Solution = extractStudentSolution(texts, t);
      const rating = ratings.find((r) => r.task === t.id);
      if (rating) {
        switch (solution.status) {
          case SolutionsStatus.NO_OCCURENCE:
            potentialMissing.push({ ratingId: rating.id, solution });
            break;
          case SolutionsStatus.SINGLE_OCCURENCE:
            correctedRatings.push({
              ratingId: rating.id,
              value: determineValue(t, solution.text),
            });
            break;
          case SolutionsStatus.MULTIPLE_OCCURENCES:
            // @TODO show in UI
            break;
          default:
        }
      }
    });

    // If more than one task can be answered consider the other ones missing
    if (potentialMissing.length !== tasks.length) {
      potentialMissing.forEach((m) => {
        correctedRatings.push({
          ratingId: m.ratingId,
          value: 0,
        });
      });
    }

    dispatch(
      ratingsUpdateMany(
        correctedRatings.map((c) => {
          return {
            id: c.ratingId,
            changes: { value: c.value, autoCorrected: true },
          };
        })
      )
    );

    return correctedRatings.length;
  };
}

export function autoCorrectSingleChoiceTasksOfSheet(sheetId: string) {
  return (dispatch, getState) => {
    // Get all targeted submissions
    const state = getState();
    let subCount = 0;
    let taskCount = 0;
    const workspace = selectWorkspacePath(state);
    const corrections = Object.values<CorrectionEntity>(
      state.corrections.entities
    ).filter((c) => {
      const submission = state.submissions.entities[c.submission];
      return submission.sheet === sheetId;
    });

    // Get all .txt files of the current submission
    corrections.forEach((c) => {
      const submission = state.submissions.entities[c.submission];
      const txtFiles = loadFilesFromWorkspace(
        submission.name,
        workspace
      ).filter((f) => Path.extname(f) === '.txt');

      // Extract the student solution from every .txt files
      const texts: string[] = txtFiles.map((f) => {
        return fs.readFileSync(f, { encoding: 'utf8' });
      });

      // For Every student solution try to correct it
      const sheet: SheetEntity = state.sheets.entities[sheetId];
      if (sheet && sheet.tasks && c.ratings) {
        const tasks: SingleChoiceTask[] = getRateableTasksFromIds(
          sheet.tasks,
          state
        ).filter((t) => isSingleChoiceTask(t)) as SingleChoiceTask[];
        const taskCountDelta = dispatch(
          autoCorrection(tasks, texts, c.ratings)
        );
        taskCount += taskCountDelta;

        if (taskCountDelta > 0) {
          subCount += 1;
        }

        const ratings = getState().ratings.entities;
        // if all ratings of the correction are autocorrected status is set to done
        if (
          c.ratings.filter((id) => {
            const rating: RatingEntity = ratings[id];
            return !rating.autoCorrected;
          }).length === 0
        ) {
          dispatch(
            correctionsUpdateOne({ id: c.id, changes: { status: Status.Done } })
          );
        }
      }

      dispatch(
        correctionsUpdateOne({
          id: c.id,
          changes: { autoCorrectionAttempted: true },
        })
      );
    });
    return { taskCount, subCount };
  };
}
