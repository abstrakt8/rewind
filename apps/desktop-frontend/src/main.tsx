import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { history, store } from "./app/store";
import { ConnectedRouter, push } from "connected-react-router";

import { AppInfoProvider, rewindTheme, TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";
import { FrontendPreloadAPI } from "@rewind/electron/api";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theater } from "./app/theater";
import { environment } from "./environments/environment";
import { downloadFinished, downloadProgressed, newVersionAvailable } from "./app/update/slice";

/**
 * If the frontend gets started with the `preload.js` (within Electron), then the API should be initialized correctly,
 * which does some IPC communication with the main process.
 */
let api: FrontendPreloadAPI;
if (window.api) {
  api = window.api;
} else {
  api = {
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

function attachListeners() {
  api.onManualReplayOpen((file) => {
    // Changes to the analyzer page
    store.dispatch(push("/analyzer"));
    void theater.analyzer.loadReplay(`local:${file}`);
  });

  api.onUpdateAvailable((version) => {
    store.dispatch(newVersionAvailable(version));
  });
  api.onDownloadFinished(() => {
    store.dispatch(downloadFinished());
  });
  api.onUpdateDownloadProgress((updateInfo) => {
    const { total, bytesPerSecond, transferred } = updateInfo;
    store.dispatch(downloadProgressed({ downloadedBytes: transferred, totalBytes: total, bytesPerSecond }));
  });
}

(async function() {
  const [appVersion, platform] = await Promise.all([api.getAppVersion(), api.getPlatform()]);
  const appInfo = { appVersion, platform };

  attachListeners();
  api.checkForUpdate();

  console.log(`Initializing with version=${appVersion} on platform=${platform}`);

  ReactDOM.render(
    <StrictMode>
      <AppInfoProvider appInfo={appInfo}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <ThemeProvider theme={rewindTheme}>
              <CssBaseline />
              <TheaterProvider theater={theater}>
                <RewindApp />
              </TheaterProvider>
            </ThemeProvider>
          </ConnectedRouter>
        </Provider>
      </AppInfoProvider>
    </StrictMode>,
    document.getElementById("root"),
  );

  // This starts off with /splash -> Maybe do it somewhere else?
  store.dispatch(push("/splash"));
})();
