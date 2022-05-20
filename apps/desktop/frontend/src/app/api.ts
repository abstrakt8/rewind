import { ipcRenderer } from "electron";

type Listener = (...args: any) => any;

// Maybe use it for onUpdateDownloadProgress
interface UpdateInfo {
  total: number;
  transferred: number;
  bytesPerSecond: number;
}

/**
 * If the frontend gets started with the `preload.js` (within Electron), then the API should be initialized correctly,
 * which does some IPC communication with the main process.
 *
 * Otherwise, we are using a mocked version that returns some dummy data or outputs something to the console.
 */
export const frontendAPI = {
  selectDirectory: (defaultPath: string) => ipcRenderer.invoke("selectDirectory", defaultPath),
  selectFile: (defaultPath: string) => ipcRenderer.invoke("selectFile", defaultPath),
  reboot: () => ipcRenderer.invoke("reboot"),
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
  getPlatform: () => ipcRenderer.invoke("getPlatform"),
  onManualReplayOpen: (listener: Listener) => ipcRenderer.on("onManualReplayOpen", (event, file) => listener(file)),
  onUpdateAvailable: (listener: Listener) => ipcRenderer.on("onUpdateAvailable", (event, version) => listener(version)),
  onUpdateDownloadProgress: (listener: Listener) =>
    ipcRenderer.on("onUpdateDownloadProgress", (event, info) => listener(info)),
  startDownloadingUpdate: () => ipcRenderer.invoke("startDownloadingUpdate"),
  onDownloadFinished: (listener: Listener) => ipcRenderer.on("onDownloadFinished", (event) => listener()),
  checkForUpdate: () => ipcRenderer.invoke("checkForUpdate"),
  quitAndInstall: () => ipcRenderer.invoke("quitAndInstall"),
};
