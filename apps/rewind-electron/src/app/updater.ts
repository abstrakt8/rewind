import { prerelease } from "semver";
import { app, ipcMain } from "electron";
import { autoUpdater, ProgressInfo, UpdateInfo } from "electron-updater";
import log from "electron-log";
import { windows } from "./windows";

/**
 * Basically once the user has signed to opt-in to the alpha version, it will always get the alpha versions.
 * @param version
 */
export function channelToUse(version: string) {
  const pre = prerelease(version);
  if (pre !== null) return { channel: "alpha", allowPrerelease: true };
  return { channel: "latest", allowPrerelease: false };
}

const oneMinute = 60 * 1000;
const fifteenMinutes = 15 * oneMinute;
const units = ["bytes", "KB", "MB", "GB", "TB", "PB"];

function niceBytes(x: any) {
  let l = 0,
    n = parseInt(x, 10) || 0;
  while (n >= 1024 && ++l) {
    n = n / 1024;
  }
  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
}

function checkForUpdates() {
  void autoUpdater.checkForUpdates().then((value => {
    log.info("[checkForUpdates] ", JSON.stringify(value));
  }));
}

function pollForUpdates() {
  // The first update should be manually done by the frontend since it might have not set up the listeners
  // checkForUpdates();
  setInterval(() => {
    checkForUpdates();
  }, fifteenMinutes);
}

function attachListeners() {
  // https://www.electron.build/auto-update#event-update-downloaded
  autoUpdater.on("download-progress", (info: ProgressInfo) => {
    log.info("[Updater] Update download progress ", info);
    const { delta, percent, total, transferred, bytesPerSecond } = info;
    windows.frontend?.webContents.send("onUpdateDownloadProgress", { total, transferred, bytesPerSecond });
  });

  autoUpdater.on("error", (error) => {
    console.log(error);
  });

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    log.info("[Updater] Update available: ", info);
    windows.frontend?.webContents.send("onUpdateAvailable", info.version);
  });

  autoUpdater.on("update-downloaded", async (info: UpdateInfo) => {
    log.info("[Updater] The new update was downloaded.");
    windows.frontend?.webContents.send("onDownloadFinished");
  });

  // In case a manual update check was done, which is not supported yet.
  autoUpdater.on("update-not-available", () => {
    log.info("[Updater] No new update has been found.");
  });

  ipcMain.handle("startDownloadingUpdate", () => {
    // Cancellation token can be given
    void autoUpdater.downloadUpdate();
  });
  ipcMain.handle("checkForUpdate", () => {
    checkForUpdates();
  });
  ipcMain.handle("quitAndInstall", () => {
    void autoUpdater.quitAndInstall(true, true);
  });
}

export function initializeAutoUpdater() {
  // Checking for updates for Windows NSIS installations only
  const { channel, allowPrerelease } = channelToUse(app.getVersion());
  autoUpdater.channel = channel;
  autoUpdater.allowPrerelease = allowPrerelease;
  autoUpdater.logger = log;
  // Needed
  log.transports.file.level = "info";

  autoUpdater.autoDownload = false;
  log.info(`Initialized auto-updater with allowPrerelease=${allowPrerelease} and channel=${channel}`);
  app.whenReady().then(async () => {
    log.info("WhenReady called");
    attachListeners();
    pollForUpdates();
  });
}
