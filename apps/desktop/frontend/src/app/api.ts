import { FrontendPreloadAPI } from "@rewind/electron/api";
import { ipcRenderer } from "electron";

/**
 * If the frontend gets started with the `preload.js` (within Electron), then the API should be initialized correctly,
 * which does some IPC communication with the main process.
 *
 * Otherwise, we are using a mocked version that returns some dummy data or outputs something to the console.
 */
export const frontendAPI: FrontendPreloadAPI = (function (): FrontendPreloadAPI {
  // if (!window.api) {
  //   throw Error("No API ");
  // }
  // return window.api;
  const frontendAPI: FrontendPreloadAPI = {
    selectDirectory: (defaultPath) => ipcRenderer.invoke("selectDirectory", defaultPath),
    selectFile: (defaultPath) => ipcRenderer.invoke("selectFile", defaultPath),
    reboot: () => ipcRenderer.invoke("reboot"),
    getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
    getPlatform: () => ipcRenderer.invoke("getPlatform"),
    onManualReplayOpen: (listener) => ipcRenderer.on("onManualReplayOpen", (event, file) => listener(file)),
    onUpdateAvailable: (listener) => ipcRenderer.on("onUpdateAvailable", (event, version) => listener(version)),
    onUpdateDownloadProgress: (listener) => ipcRenderer.on("onUpdateDownloadProgress", (event, info) => listener(info)),
    startDownloadingUpdate: () => ipcRenderer.invoke("startDownloadingUpdate"),
    onDownloadFinished: (listener) => ipcRenderer.on("onDownloadFinished", (event) => listener()),
    checkForUpdate: () => ipcRenderer.invoke("checkForUpdate"),
    quitAndInstall: () => ipcRenderer.invoke("quitAndInstall"),
  };
  return frontendAPI;
})();
