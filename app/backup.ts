import fs from 'fs';
import * as Path from 'path';
import { app, ipcMain, WebContents } from 'electron';
import * as BackupIPC from './constants/BackupIPC';

export default class Backup {
  static backupDir: string = Path.join(app.getPath('userData'), 'Backup');

  private interval: number = 5 * 60 * 1000;

  private retention: number = 30 * 24 * 60 * 60 * 1000;

  private iteration = 0;

  private path: string | undefined;

  private intervalId: NodeJS.Timeout | undefined;

  private webContents: Electron.WebContents | undefined;

  constructor() {
    if (!fs.existsSync(Backup.backupDir)) {
      fs.mkdirSync(Backup.backupDir);
    }

    ipcMain.on(BackupIPC.BACKUP_ONCE, (event, p) => {
      this.makeBackupOnce(event.sender, p);
    });

    ipcMain.on(BackupIPC.BACKUP_START, (event, p) => {
      this.startBackup(event.sender, p);
    });

    ipcMain.on(BackupIPC.BACKUP_STOP, () => {
      this.stopBackup();
    });
  }

  public startBackup(
    webContents: WebContents,
    filePath: string,
    iteration = 0
  ) {
    this.path = filePath;
    this.iteration = iteration;
    this.webContents = webContents;
    this.intervalId = setInterval(() => this.makeBackup(), this.interval);
  }

  public stopBackup() {
    this.webContents = undefined;
    this.path = undefined;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  public makeBackup() {
    this.deleteOldBackups();

    if (this.path) {
      const fileName =
        this.iteration >= 0
          ? `${Path.basename(this.path)}.bak${this.iteration + 1}`
          : `${Path.basename(this.path)}.bak${new Date().toISOString()}`;
      const dest = Path.join(Backup.backupDir, fileName);

      fs.copyFileSync(this.path, dest);

      if (this.webContents !== undefined) {
        // TODO: check if backup was really successful
        if (fs.existsSync(dest)) {
          if (this.iteration >= 0) {
            this.iteration = (this.iteration + 1) % 3;
          }
          this.webContents.send(BackupIPC.BACKUP_SUCCESSFUL);
        } else {
          this.webContents.send(BackupIPC.BACKUP_FAILED);
        }
      }
    } else {
      this.stopBackup();
    }
  }

  public deleteOldBackups() {
    const backupFilePaths = fs.readdirSync(Backup.backupDir);
    backupFilePaths.forEach((p) => {
      const path = Path.join(Backup.backupDir, p);
      if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        const date = new Date(stats.mtimeMs);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff >= this.retention) {
          fs.unlinkSync(path);
        }
      }
    });
  }

  public makeBackupOnce(webContents: WebContents, path: string) {
    // Temporary store current values
    const pathTemp = this.path;
    const wcTemp = this.webContents;
    const itTemp = this.iteration;
    const intTemp = this.intervalId !== undefined;

    // Clear active backup job
    this.stopBackup();

    // Initialize new values
    this.path = path;
    this.webContents = webContents;
    this.iteration = -1;

    // Make backup
    this.makeBackup();

    // Restore previously active backup
    if (
      intTemp &&
      pathTemp !== undefined &&
      wcTemp !== undefined &&
      intTemp !== undefined
    ) {
      this.startBackup(wcTemp, pathTemp, itTemp);
    }
  }
}
