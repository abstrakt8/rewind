import { app } from "electron";
import { environment } from "./environments/environment";
import { RewindElectronApp } from "./app/RewindElectronApp";
import { setupEventListeners } from "./app/rewind.events";
import { readRewindElectronSettings } from "./app/config";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

function isDevelopmentMode() {
  if (process.env.ELECTRON_IS_DEV) return true;
  return !environment.production;
}

(function main() {
  log.transports.file.level = "info";

  // Checking for updates
  autoUpdater.channel = "latest";
  autoUpdater.logger = log;
  autoUpdater.allowPrerelease = true;
  autoUpdater.checkForUpdatesAndNotify();
  const logFile = log.transports.file.getFile();
  console.log("LogFilePath" + logFile.path);

  log.info("Test");

  console.log(`AppDataPath=${app.getPath("appData")}`);
  const userDataPath = app.getPath("userData");
  const settings = readRewindElectronSettings(userDataPath);
  const isDev = isDevelopmentMode();
  console.log("Starting MainWindow with settings ", JSON.stringify(settings), isDev);
  const rewindElectronApp = new RewindElectronApp(app, settings, isDev);
  rewindElectronApp.boot();
  setupEventListeners(rewindElectronApp);
})();
