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
};

contextBridge.exposeInMainWorld("api", frontendAPI);
