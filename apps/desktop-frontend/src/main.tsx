import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { history, store } from "./app/store";
import { ConnectedRouter, push } from "connected-react-router";

import { AppInfoProvider, RewindTheme, TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";
import { FrontendPreloadAPI } from "@rewind/electron/api";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theater } from "./app/theater";
import { environment } from "./environments/environment";

declare global {
  interface Window {
    api: FrontendPreloadAPI;
  }
}

async function initialize() {
  let api: FrontendPreloadAPI;
  if (window.api) {
    api = window.api;
  } else {
    api = {
      getAppVersion: () => Promise.resolve(environment.appVersion),
      getPlatform: () => Promise.resolve(environment.platform),
      reboot: () => console.log("Rebooting ..."),
      selectDirectory: () => Promise.resolve("C:\\Mocked\\Path"),
    };
  }
  const [appVersion, platform] = await Promise.all([api.getAppVersion(), api.getPlatform()]);
  const appInfo = { appVersion, platform };

  console.log(`Initializing with version=${appVersion} on platform=${platform}`);

  ReactDOM.render(
    <StrictMode>
      <AppInfoProvider appInfo={appInfo}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <ThemeProvider theme={RewindTheme}>
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
}

initialize();
