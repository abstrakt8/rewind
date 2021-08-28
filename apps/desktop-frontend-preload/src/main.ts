import { contextBridge, ipcRenderer } from "electron";
import { ElectronAPI } from "@rewind/electron/api";

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  platform: process.platform,
};

contextBridge.exposeInMainWorld("electron", electronAPI);
