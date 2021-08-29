import { ipcRenderer } from "electron";
import { BackendPreloadAPI } from "@rewind/electron/api";

declare global {
  interface Window {
    settings: BackendPreloadAPI;
  }
}

window.settings = {
  getAppDataPath: () => ipcRenderer.invoke("getAppDataPath"),
  getUserDataPath: () => ipcRenderer.invoke("getUserDataPath"),
  getAppResourcesPath: () => ipcRenderer.invoke("getAppResourcesPath"),
};
