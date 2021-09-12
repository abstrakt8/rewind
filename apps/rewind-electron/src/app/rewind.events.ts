import { app, dialog, ipcMain } from "electron";
import { BackendPreloadAPI, FrontendPreloadAPI } from "@rewind/electron/api";
import { RewindElectronApp } from "./RewindElectronApp";

async function userSelectDirectory(defaultPath: string) {
  const { canceled, filePaths } = await dialog.showOpenDialog({ defaultPath, properties: ["openDirectory"] });
  if (canceled || filePaths.length === 0) {
    return null;
  } else {
    return filePaths[0];
  }
}

const backendPreloadAPI: BackendPreloadAPI = {
  getPath(type) {
    const result = (function () {
      switch (type) {
        case "appData":
          return app.getPath("appData");
        case "userData":
          return app.getPath("userData");
        case "logs":
          return app.getPath("logs");
        case "appResources":
          return process.resourcesPath;
      }
    })();
    return Promise.resolve(result);
  },
};

const frontendPreloadAPI: FrontendPreloadAPI = {
  getAppVersion: () => Promise.resolve(app.getVersion()),
  getPlatform: () => Promise.resolve(process.platform),
  reboot: () => {
    app.relaunch();
    app.quit();
  },
  selectDirectory: userSelectDirectory,
};

export function setupEventListeners(rewindElectronApp: RewindElectronApp) {
  // BackendAPI
  ipcMain.handle("getPath", (event, type) => backendPreloadAPI.getPath(type));

  // Others

  // Does not work
  // for (const [key, handler] of Object.entries(frontendPreloadAPI)) {
  //   ipcMain.handle(key, (event, args) => handler(...args));
  // }

  ipcMain.handle("selectDirectory", (event, defaultPath) => frontendPreloadAPI.selectDirectory(defaultPath));
  ipcMain.handle("getPlatform", () => frontendPreloadAPI.getPlatform());
  ipcMain.handle("getAppVersion", () => frontendPreloadAPI.getAppVersion());
  ipcMain.handle("reboot", () => frontendPreloadAPI.reboot());
}
