import fs from 'fs';
import * as Path from 'path';
import { selectWorkspacePath } from '../features/workspace/workspaceSlice';
import RatingEntity from '../model/RatingEntity';
import { ratingsUpdateOne } from '../model/RatingSlice';
import SingleChoiceTask from '../model/SingleChoiceTask';
import { getFilesForCorrectionFromWorkspace } from './FileAccess';
import { getRateableTasks, isSingleChoiceTask } from './TaskUtil';
import SheetEntity from '../model/SheetEntity';
import CorrectionEntity from '../model/CorrectionEntity';
import { correctionsUpdateOne } from '../model/CorrectionsSlice';
import Status from '../model/Status';

export function extractStudentSolution(
  text: string
): Map<string, string> | undefined {
  const solution: Map<string, string> = new Map<string, string>();

  // Extracts <one char>[)|:|=][i|v]
  const pattern = /(\w)[ |\t]*?[)|:|=]\s*[(]?\s*([i|v]+)/gim;

  const matches = text.matchAll(pattern);

  Array.from(matches).forEach((match) => {
    if (match && match.length === 3) {
      const [, taskName, solutionText] = match;
      solution.set(taskName, solutionText);
    }
  });

  return solution.size > 0 ? solution : undefined;
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
  studentSolution: Map<string, string>,
  ratingIds: string[]
) {
  return (dispatch, getState) => {
    let count = 0;
    const state = getState();
    const ratings: RatingEntity[] = ratingIds.map(
      (id) => state.ratings.entities[id]
    );

    tasks.forEach((t) => {
      const solution = studentSolution.get(t.name);
      const rating = ratings.find((r) => r.task === t.id);
      if (rating && solution) {
        const value = determineValue(t, solution);
        dispatch(
          ratingsUpdateOne({
            id: rating.id,
            changes: { value, autoCorrected: true },
          })
        );
        count += 1;
      }
    });
    return count;
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
      const txtFiles = getFilesForCorrectionFromWorkspace(
        submission.name,
        workspace
      ).filter((f) => Path.extname(f) === '.txt');

      // Extract the student solution from every .txt files
      let studentSolution: Map<string, string> | undefined;
      txtFiles.forEach((f) => {
        const text = fs.readFileSync(f, { encoding: 'utf8' });
        const sol = extractStudentSolution(text);
        // Only consider the one with the most matches
        if (
          (sol && !studentSolution) ||
          (sol && studentSolution && studentSolution.size < sol.size)
        ) {
          studentSolution = sol;
        }
      });

      // For Every student solution try to correct it
      const sheet: SheetEntity = state.sheets.entities[sheetId];
      if (sheet && sheet.tasks && studentSolution && c.ratings) {
        const tasks: SingleChoiceTask[] = getRateableTasks(
          sheet.tasks,
          state
        ).filter((t) => isSingleChoiceTask(t)) as SingleChoiceTask[];
        taskCount += dispatch(
          autoCorrection(tasks, studentSolution, c.ratings)
        );
        subCount += 1;
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
    });
    return { taskCount, subCount };
  };
}
