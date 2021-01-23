import YAML from 'yaml';
import { OpenDialogReturnValue, remote } from 'electron';
import fs from 'fs';
import * as Path from 'path';
import deepEqual from 'deep-equal';
import 'setimmediate';
import archiver from 'archiver';
import Status from '../model/Status';
import Task from '../model/TaskEntity';
import { serializeCorrection } from './Formatter';

export function createDirectory(dir: string) {
  if (fs.existsSync(dir)) {
    // throw new Error(`Directory "${dir}" already exists!`);
    console.log(`Directory "${dir}" already exists! Skipping creation.`);
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dir)) {
    throw new Error(`Cannot create directory "${dir}"!`);
  }
  console.log(`Directory created at ${dir}`);
}

export async function openDirectory(): Promise<string> {
  const returnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog(
    remote.getCurrentWindow(),
    {
      properties: ['openDirectory'],
    }
  );

  if (returnValue.canceled || returnValue.filePaths.length !== 1) {
    throw new Error('No directory selected');
  }
  const dir: string = returnValue.filePaths[0];
  console.log(`Open directory: ${dir}`);
  return dir;
}

export function getAllDirectoriesInDirectory(dir: string, dirs: string[] = []) {
  if (!fs.existsSync(dir)) {
    return dirs;
  }
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const name = Path.normalize(`${dir}/${file}`);
    if (fs.statSync(name).isDirectory() && !name.includes('MACOSX')) {
      dirs.push(name);
      getAllDirectoriesInDirectory(name, dirs);
    }
  });
  return dirs;
}

export function getAllFilesInDirectory(
  dir: string,
  files_: string[] = []
): string[] {
  if (!fs.existsSync(dir)) {
    return files_;
  }
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const name = Path.normalize(`${dir}/${file}`);
    if (fs.statSync(name).isDirectory() && !name.includes('MACOSX')) {
      getAllFilesInDirectory(name, files_);
    } else if (!fs.statSync(name).isDirectory()) {
      files_.push(name);
    }
  });
  return files_;
}

export function getAllRatingFiles(dir: string): string[] {
  const ratingFilePattern = new RegExp('bewertung_([a-z0-9]{16})\\.txt', 'g');
  const filePaths: string[] = getAllFilesInDirectory(dir);
  return filePaths.filter((file) => file.match(ratingFilePattern));
}

export function getAllSubmissionFiles(dir: string): string[] {
  const ratingFilePattern = new RegExp('bewertung_([a-z0-9]{16})\\.txt', 'g');
  const filePaths: string[] = getAllFilesInDirectory(dir);
  return filePaths.filter((file) => !file.match(ratingFilePattern));
}

export function getAllSubmissionDirectories(dir: string): string[] {
  const directoryPattern = new RegExp('([a-z0-9]{16})[\\\\/|\\\\]?$', 'g');
  const dirPaths: string[] = getAllDirectoriesInDirectory(dir);
  dirPaths.push(dir);
  return dirPaths.filter((d) => d.match(directoryPattern));
}

export function createSubmissionFileStruture(dir: string, workspaceDir) {
  const submissionName: string = Path.parse(dir).name;
  const subDir: string = Path.join(workspaceDir, submissionName);

  // Reading the Uni2Work rating file
  const ratingFilePaths: string[] = getAllRatingFiles(dir);
  if (ratingFilePaths.length > 1) {
    throw new Error('More than one rating file was found!');
  } else if (ratingFilePaths.length === 0) {
    throw new Error('No rating file was found!');
  }

  const ratingFilePath: string = ratingFilePaths[0];
  const ratingFileContents = fs.readFileSync(ratingFilePath, 'utf8');

  // Parse the rating file
  const ratingFile = YAML.parseDocument(ratingFileContents);

  // TODO: check yml structure
  if (ratingFile.errors.length > 0) {
    throw new Error(`Could not parse the rating file ${ratingFilePath}!`);
  }

  // Create submisson directory in app data
  createDirectory(subDir);

  // Store the rating file it in app data
  fs.writeFileSync(
    Path.join(subDir, `config.yml`),
    `${ratingFile.toString()}...\n`
  );

  // Coping all the submission files
  const filesDir: string = Path.join(subDir, 'files');
  createDirectory(filesDir);

  const files = getAllSubmissionFiles(dir);
  files.forEach((file) => {
    const { base } = Path.parse(file);
    const sourceDir: string = Path.parse(file).dir;
    fs.copyFileSync(file, Path.join(filesDir, base));
    console.log(`Copied file ${base} from ${sourceDir} to ${filesDir}`);
  });

  return ratingFile.toJSON();
}

export function getAllRatingFilesInAppData(dir: string): string[] {
  const filePaths: string[] = getAllFilesInDirectory(dir);
  return filePaths.filter((file) => Path.parse(file).base === 'config.yml');
}

export function getSubmissionFromAppDataDir(
  dir: string,
  submissionDir: string
) {
  const ratingFilePaths: string[] = getAllRatingFilesInAppData(dir);

  if (ratingFilePaths.length > 1) {
    throw new Error('More than one rating file was found!');
  } else if (ratingFilePaths.length === 0) {
    throw new Error('No rating file was found!');
  }

  const ratingFilePath: string = ratingFilePaths[0];
  const ratingFileContents = fs.readFileSync(ratingFilePath, 'utf8');

  // Parse the rating file
  const ratingFile = YAML.parseDocument(ratingFileContents);

  // TODO: check yml structure
  if (ratingFile.errors.length > 0) {
    throw new Error(`Could not parse the rating file ${ratingFilePath}!`);
  }

  const ratingFileJson = ratingFile.toJSON();

  console.log(JSON.stringify(ratingFileJson));

  const filesDir: string = Path.join(
    submissionDir,
    ratingFileJson.submission,
    'files'
  );
  const files: string[] = getAllFilesInDirectory(filesDir);
  ratingFileJson.files = files;
  ratingFileJson.path = ratingFilePath;
  if (ratingFileJson.status === undefined) {
    ratingFileJson.status = ratingFileJson.rating_done
      ? Status.Done
      : Status.Todo;
  }

  if (ratingFileJson.points === null) {
    ratingFileJson.points = 0;
  }

  return { data: ratingFileContents, files };
  // return ratingFileJson;
}

export function saveSubmission(submission) {
  const config = YAML.stringify(submission);
  if (submission.path) {
    fs.writeFileSync(submission.path, `${config}...\n`);
  }
}

export function saveSubmissions(submissions: any[]) {
  submissions?.forEach((sub) => {
    saveSubmission(sub);
  });
}

export function getUniqueSheets(submissions: any[]) {
  const info = submissions?.map((sub) => {
    const s: any = {
      term: sub.term,
      school: sub.school,
      course: sub.course,
      sheet: sub.sheet,
      rated_by: sub.rated_by,
    };
    return s;
  });

  const uniqueSheets: any[] = [];
  info?.forEach((sub) => {
    let isEq = false;
    uniqueSheets?.forEach((uniq) => {
      if (deepEqual(sub, uniq)) {
        isEq = true;
      }
    });

    if (!isEq) {
      uniqueSheets?.push(sub);
    }
  });

  return uniqueSheets;
}

export function exportCorrections(
  submissions: any[],
  zipPath: string,
  condComments: any[] = []
) {
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });
  archive.pipe(output);

  output.on('end', () => {
    console.log('Data has been drained');
  });

  output.on('close', () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log(
      'archiver has been finalized and the output file descriptor has closed.'
    );
  });
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', (err) => {
    throw err;
  });

  console.log(`Writing ${submissions.length} submissions!`);
  // Add all submission directories
  submissions.forEach((sub) => {
    const { files, submission } = sub;

    const doc = new YAML.Document({
      term: sub.term,
      school: sub.school,
      course: sub.course,
      sheet: sub.sheet,
      rated_by: sub.rated_by,
      rated_at: sub.rated_at,
      submission: sub.submission,
      points: sub.points,
      rating_done: sub.rating_done,
    });

    const ratingFile = `${doc.toString()}...\n${serializeCorrection(
      sub,
      condComments
    )}`;

    archive.append(ratingFile, {
      name: `/${submission}/bewertung_${submission}.txt`,
    });

    files.forEach((file) => {
      archive.append(fs.createReadStream(file), {
        name: `/${submission}/files/${Path.parse(file).base}`,
      });
    });
  });

  archive.finalize();
}

export function hasTasksWithZeroMax(tasks: any): boolean {
  let zeroMax = false;
  tasks?.forEach((t) => {
    if (t?.tasks?.length > 0) {
      zeroMax = hasTasksWithZeroMax(t.tasks as Task[]) ? true : zeroMax;
    } else if (t?.max && t?.max <= 0) {
      zeroMax = true;
    }
  });
  return zeroMax;
}

export function isSubmissionFromSheet(s, sheet) {
  if (sheet) {
    return (
      s.term === sheet.term &&
      s.school === sheet.school &&
      s.course === sheet.course &&
      s.sheet.name === sheet.sheet.name &&
      s.rated_by === sheet.rated_by
    );
  }
  return false;
}

export function getSubmissionsOfSheet(sheet: any, submissionDir: string) {
  const path = submissionDir;
  const subs: any[] = [];
  const submissionDirectories: string[] = getAllSubmissionDirectories(path);
  submissionDirectories.forEach((dir, i) => {
    const temp = getSubmissionFromAppDataDir(dir, submissionDir);
    temp.id = i;
    subs.push(temp);
  });
  return subs.filter((s) => isSubmissionFromSheet(s, sheet));
}

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = Path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function deleteSubmission(s: any, submissionDir: string) {
  deleteFolderRecursive(Path.join(submissionDir, s.submission));
}

export function deleteSheet(sheet: any, submissionDir: string) {
  getSubmissionsOfSheet(sheet, submissionDir).forEach((s) =>
    deleteSubmission(s, submissionDir)
  );
}

export function existsInAppDir(path: string, submissionDir: string): boolean {
  const appPath = Path.join(submissionDir, Path.parse(path).base);
  return fs.existsSync(appPath);
}
/*
export function denormalizeTasks(taskIds: string[], tasks: Task[]): any[] {
  return taskIds
    .map((id: string) => {
      const res = tasks.find((t: Task) => t.id === id);
      if (res !== undefined) {
        return res;
      }
      console.log(id);
      throw new Error();
    })
    .map((t: Task) => {
      if (t?.tasks?.length > 0) {
        return {
          ...t,
          tasks: denormalizeTasks(t.tasks as string[], tasks),
        };
      }
      return t;
    });
}
*/
