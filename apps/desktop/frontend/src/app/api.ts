import { FrontendPreloadAPI } from "@rewind/electron/api";
import { environment } from "../environments/environment";

/**
 * If the frontend gets started with the `preload.js` (within Electron), then the API should be initialized correctly,
 * which does some IPC communication with the main process.
 *
 * Otherwise, we are using a mocked version that returns some dummy data or outputs something to the console.
 */
export const frontendAPI: FrontendPreloadAPI = (function (): FrontendPreloadAPI {
  if (window.api) {
    return window.api;
  } else {
    return {
      getAppVersion: () => Promise.resolve(environment.appVersion),
      getPlatform: () => Promise.resolve(environment.platform),
      reboot: () => console.log("Rebooting ..."),
      selectDirectory: () => Promise.resolve("C:\\Mocked\\Path"),
      selectFile: () => Promise.resolve("C:\\Mocked\\File.osr"),
      onManualReplayOpen: (listener) => console.log(`Registered a listener for opening replay files manually`),
      quitAndInstall: () => console.log("Sent QuitAndInstall to the main process"),

      // Updates
      onUpdateAvailable: (listener) => console.log(`Registered a listener for receiving a manual update`),
      startDownloadingUpdate: () => console.log("Starting the update..."),
      onUpdateDownloadProgress: (listener) => console.log(`Registered a listener for receiving a download progress`),
      onDownloadFinished: (listener) => console.log(`Registered a listener for onDowlnoadFinished`),
      checkForUpdate: () => console.log(`Checking for updates`),
    };
  }
})();
