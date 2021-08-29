import { contextBridge, ipcRenderer } from "electron";
import { ElectronAPI, SecureElectronAPI, validReceiveChannels, validSendChannels } from "@rewind/electron/api";

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  platform: process.platform,
};

contextBridge.exposeInMainWorld("electron", electronAPI);

// Source: https://github.com/electron/electron/issues/9920#issuecomment-575839738
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

const secureApi: SecureElectronAPI = {
  send: (channel, data) => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    if (validReceiveChannels.includes(channel)) {
      const listener = (event, ...args) => func(...args);
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  },
};

contextBridge.exposeInMainWorld("api", secureApi);
