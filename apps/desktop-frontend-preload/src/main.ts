import { contextBridge, ipcRenderer } from "electron";
import { FrontendPreloadAPI } from "@rewind/electron/api";

// preload.js for the frontend

const frontendAPI: FrontendPreloadAPI = {
  selectDirectory: (defaultPath) => ipcRenderer.invoke("selectDirectory", defaultPath),
  selectFile: (defaultPath) => ipcRenderer.invoke("selectFile", defaultPath),
  reboot: () => ipcRenderer.invoke("reboot"),
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  getPlatform: () => ipcRenderer.invoke("getPlatform"),
  onManualReplayOpen: (listener) => ipcRenderer.on("onManualReplayOpen", (event, file) => listener(file)),
  onUpdateAvailable: (listener) => ipcRenderer.on("onUpdateAvailable", (event, version) => listener(version)),
  onUpdateProgress: (listener) => ipcRenderer.on("onUpdateProgress", (event, info) => listener(info)),
  startDownloadingUpdate: () => ipcRenderer.invoke("startDownloadingUpdate"),
  onDownloadFinished: (listener) => ipcRenderer.on("onDownloadFinished", (event) => listener()),
};

contextBridge.exposeInMainWorld("api", frontendAPI);
