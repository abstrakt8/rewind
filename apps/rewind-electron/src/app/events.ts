import { app, dialog, ipcMain } from "electron";
import { BackendPreloadAPI } from "@rewind/electron/api";

async function userSelectDirectory(defaultPath: string) {
  const { canceled, filePaths } = await dialog.showOpenDialog({ defaultPath, properties: ["openDirectory"] });
  if (canceled || filePaths.length === 0) {
    return null;
  } else {
    return filePaths[0];
  }
}

async function userSelectFile(defaultPath: string) {
  const { canceled, filePaths } = await dialog.showOpenDialog({ defaultPath, properties: ["openFile"] });
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

export function setupEventListeners() {
  // BackendAPI
  ipcMain.handle("getPath", (event, type) => backendPreloadAPI.getPath(type));

  // Others

  // Does not work
  // for (const [key, handler] of Object.entries(frontendPreloadAPI)) {
  //   ipcMain.handle(key, (event, args) => handler(...args));
  // }
  ipcMain.handle("startDownloadingUpdate", () => {});
  ipcMain.handle("selectDirectory", (event, defaultPath) => userSelectDirectory(defaultPath));
  ipcMain.handle("selectFile", (event, defaultPath) => userSelectFile(defaultPath));
  ipcMain.handle("getPlatform", () => process.platform);
  ipcMain.handle("getAppVersion", () => app.getVersion());
  ipcMain.handle("reboot", () => {
    app.relaunch();
    app.quit();
  });
}
