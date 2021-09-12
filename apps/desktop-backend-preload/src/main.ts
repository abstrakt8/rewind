import { ipcRenderer } from "electron";
import { BackendPreloadAPI } from "@rewind/electron/api";

declare global {
  interface Window {
    settings: BackendPreloadAPI;
  }
}

window.settings = {
  getPath: (type) => ipcRenderer.invoke("getPath", type),
};
