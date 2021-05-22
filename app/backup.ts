import fs from 'fs';
import * as Path from 'path';
import { app, IpcMainEvent, ipcMain } from 'electron';
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

    ipcMain.on(BackupIPC.BACKUP_START, (event, p) => {
      this.startBackup(event, p);
    });

    ipcMain.on(BackupIPC.BACKUP_STOP, () => {
      this.stopBackup();
    });
  }

  public startBackup(event: IpcMainEvent, filePath: string) {
    this.path = filePath;
    this.iteration = 0;
    this.webContents = event.sender;
    this.intervalId = setInterval(() => this.makeBackup(), this.interval);
  }

  public stopBackup() {
    this.webContents = undefined;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public makeBackup() {
    this.deleteOldBackups();

    if (this.path) {
      const dest = Path.join(
        Backup.backupDir,
        `${Path.basename(this.path)}.bak${this.iteration + 1}`
      );

      fs.copyFileSync(this.path, dest);

      if (this.webContents !== undefined) {
        // TODO: check if backup was really successful
        if (fs.existsSync(dest)) {
          this.iteration = (this.iteration + 1) % 3;
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
        const date = new Date(stats.atimeMs);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff >= this.retention) {
          fs.unlinkSync(path);
        }
      }
    });
  }
}
