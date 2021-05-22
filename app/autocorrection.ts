import { ipcMain, IpcMainEvent, WebContents } from 'electron';
import fs from 'fs';
import * as Path from 'path';
import {
  AUTOCORRECTION_PROGRESS,
  AUTOCORRECTION_START,
  AUTOCORRECTION_SUCCESSFUL,
} from './constants/AutoCorrectionIPC';
import Correction from './model/Correction';
import Rating from './model/Rating';
import SingleChoiceTask from './model/SingleChoiceTask';
import { loadFilesFromWorkspaceMainProcess } from './utils/FileAccess';
import { getRateableTasks, isSingleChoiceTask } from './utils/TaskUtil';

export interface AutoCorrectionProgress {
  name: string;
  index: number;
  total: number;
}

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

export default class AutoCorrection {
  constructor() {
    ipcMain.on(AUTOCORRECTION_START, (event: IpcMainEvent, arg) => {
      const { sender } = event;
      AutoCorrection.autoCorrectSingleChoiceTasksOfSheet(
        arg.corrections,
        arg.workspace,
        sender
      );
    });
  }

  static extractStudentSolution(
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

  static determineValue(task: SingleChoiceTask, solution: string): number {
    return solution.toLowerCase().trim() ===
      task.answer.text.toLowerCase().trim()
      ? task.answer.value
      : 0;
  }

  static autoCorrection(
    tasks: SingleChoiceTask[],
    texts: string[],
    ratings: Rating[]
  ) {
    const correctedRatings: { ratingId: string; value: number }[] = [];
    const potentialMissing: { ratingId: string; solution: Solution }[] = [];

    tasks.forEach((t) => {
      const solution: Solution = AutoCorrection.extractStudentSolution(
        texts,
        t
      );
      const rating = ratings.find((r) => r.task.id === t.id);
      if (rating) {
        switch (solution.status) {
          case SolutionsStatus.NO_OCCURENCE:
            potentialMissing.push({ ratingId: rating.id, solution });
            break;
          case SolutionsStatus.SINGLE_OCCURENCE:
            correctedRatings.push({
              ratingId: rating.id,
              value: AutoCorrection.determineValue(t, solution.text),
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

    return correctedRatings;
  }

  static autoCorrectSingleChoiceTasksOfSheet(
    corrections: Correction[],
    workspace: string,
    sender: WebContents
  ) {
    // Get all targeted submissions
    let subCount = 0;
    let taskCount = 0;

    // Get all .txt files of the current submission
    const finishedCorrectionIds: string[] = [];
    const attemptedCorrectionIds: string[] = [];
    const totalCorrectedRatings: {
      ratingId: string;
      value: number;
    }[] = [];
    corrections.forEach((c, i) => {
      sender.send(AUTOCORRECTION_PROGRESS, {
        index: i,
        total: corrections.length,
        name: c.submission.name,
      });

      const { submission } = c;
      const txtFiles = loadFilesFromWorkspaceMainProcess(
        submission.name,
        workspace
      ).filter((f) => Path.extname(f) === '.txt');

      // Extract the student solution from every .txt files
      const texts: string[] = txtFiles.map((f) => {
        return fs.readFileSync(f, { encoding: 'utf8' });
      });

      // For Every student solution try to correct it
      const { sheet } = submission;
      if (sheet && sheet.tasks && c.ratings) {
        const tasks: SingleChoiceTask[] = getRateableTasks(
          sheet.tasks
        ).filter((t) => isSingleChoiceTask(t)) as SingleChoiceTask[];
        const correctedRatings = AutoCorrection.autoCorrection(
          tasks,
          texts,
          c.ratings
        );
        totalCorrectedRatings.push(...correctedRatings);
        taskCount += correctedRatings.length;

        if (correctedRatings.length > 0) {
          subCount += 1;
        }

        // if all ratings of the correction are autocorrected status is set to done
        if (
          c.ratings.filter((rating) => {
            return !rating.autoCorrected;
          }).length === 0
        ) {
          finishedCorrectionIds.push(c.id);
        }
      }

      attemptedCorrectionIds.push(c.id);
    });

    sender.send(AUTOCORRECTION_SUCCESSFUL, {
      attemptedCorrectionIds,
      finishedCorrectionIds:
        finishedCorrectionIds.length > 0 ? finishedCorrectionIds : undefined,
      totalCorrectedRatings:
        totalCorrectedRatings.length > 0 ? totalCorrectedRatings : undefined,
      taskCount,
      subCount,
    });
  }
}
