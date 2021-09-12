import { contextBridge, ipcRenderer } from "electron";
import { FrontendPreloadAPI } from "@rewind/electron/api";

// preload.js for the frontend

const frontendAPI: FrontendPreloadAPI = {
  selectDirectory: (defaultPath) => ipcRenderer.invoke("selectDirectory", defaultPath),
  reboot: () => ipcRenderer.invoke("reboot"),
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  getPlatform: () => ipcRenderer.invoke("getPlatform"),
};

contextBridge.exposeInMainWorld("api", frontendAPI);
