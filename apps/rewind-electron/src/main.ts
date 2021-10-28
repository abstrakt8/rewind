// TODO: Squirrel events
// TODO: Electron events (?) -> gives app version and exit
import { app } from "electron";
import { environment } from "./environments/environment";
import { RewindElectronApp } from "./app/RewindElectronApp";
import { setupEventListeners } from "./app/rewind.events";
import { readRewindElectronSettings } from "./app/config";

function isDevelopmentMode() {
  if (process.env.ELECTRON_IS_DEV) {
    return true;
  }
  return !environment.production;
}

function main() {
  console.log(`AppDataPath=${app.getPath("appData")}`);
  const userDataPath = app.getPath("userData");
  const settings = readRewindElectronSettings(userDataPath);
  const isDev = isDevelopmentMode();
  console.log("Starting MainWindow with settings ", JSON.stringify(settings), isDev);
  const rewindElectronApp = new RewindElectronApp(app, settings, isDev);
  rewindElectronApp.boot();
  setupEventListeners(rewindElectronApp);
}

main();

// console.log("Starting MainWindow with settings ", JSON.stringify(settings));
// const rewindElectronApp = new RewindElectronApp(app, { osuFolderPath: "" }, isDevelopmentMode());
// rewindElectronApp.boot();
// setupEventListeners(rewindElectronApp);
