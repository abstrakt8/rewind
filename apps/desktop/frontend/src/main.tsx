import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { store } from "./app/store";

import { AppInfoProvider, rewindTheme, TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theater } from "./app/theater";
import { HashRouter } from "react-router-dom";
import { frontendAPI } from "./app/api";

(async function () {
  // TODO: Initialize it within the <RewindApp/>?
  const [appVersion, platform] = await Promise.all([frontendAPI.getAppVersion(), frontendAPI.getPlatform()]);
  const appInfo = { appVersion, platform };

  console.log(`Initializing with version=${appVersion} on platform=${platform}`);

  ReactDOM.render(
    <StrictMode>
      <AppInfoProvider appInfo={appInfo}>
        <Provider store={store}>
          {/* Using `HashRouter` due to Electron https://github.com/remix-run/history/blob/dev/docs/api-reference.md#createhashhistory */}
          <HashRouter>
            <ThemeProvider theme={rewindTheme}>
              <CssBaseline />
              <TheaterProvider theater={theater}>
                <RewindApp />
              </TheaterProvider>
            </ThemeProvider>
          </HashRouter>
        </Provider>
      </AppInfoProvider>
    </StrictMode>,
    document.getElementById("root"),
  );

  // This starts off with /splash -> Maybe do it somewhere else?
  // store.dispatch(push("/splash"));
})();
