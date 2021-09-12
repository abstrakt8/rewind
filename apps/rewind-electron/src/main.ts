// TODO: Squirrel events
// TODO: Electron events (?) -> gives app version and exit
import { app } from "electron";
import { environment } from "./environments/environment";
import { RewindElectronApp } from "./app/RewindElectronApp";
import { setupEventListeners } from "./app/rewind.events";

function isDevelopmentMode() {
  if (process.env.ELECTRON_IS_DEV) {
    return true;
  }
  return !environment.production;
}

const rewindElectronApp = new RewindElectronApp(app, isDevelopmentMode());
rewindElectronApp.boot();

setupEventListeners(rewindElectronApp);
