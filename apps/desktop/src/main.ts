import SquirrelEvents from "./app/events/squirrel.events";
import { app, ipcMain, dialog } from "electron";
import { RewindElectronApp } from "./app/app";
import { environment } from "./environments/environment";

function isDevelopmentMode() {
  const isEnvironmentSet: boolean = "ELECTRON_IS_DEV" in process.env;
  const getFromEnvironment: boolean = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
  return isEnvironmentSet ? getFromEnvironment : !environment.production;
}

if (SquirrelEvents.handleEvents()) {
  // squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
  app.quit();
}

const rewindElectronApp = new RewindElectronApp(app, true);
rewindElectronApp.boot();

async function selectDirectory(defaultPath: string) {
  const { canceled, filePaths } = await dialog.showOpenDialog({ defaultPath, properties: ["openDirectory"] });
  if (canceled || filePaths.length === 0) {
    return null;
  } else {
    return filePaths[0];
  }
}

ipcMain.on("openDirectorySelect", (event, args) => {
  selectDirectory(args[0]).then((choice) => {
    rewindElectronApp.mainWindow.webContents.send("directorySelected", choice);
  });
});

ipcMain.on("reboot", (event, args) => {
  app.relaunch();
  app.quit();
});

// static bootstrapAppEvents() {
//
//   // initialize auto updater service
//   if (!App.isDevelopmentMode()) {
//     // UpdateEvents.initAutoUpdateService();
//   }
// }
