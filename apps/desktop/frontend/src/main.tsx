import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { store } from "./app/store";

import { RewindApp } from "./app/RewindApp";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { HashRouter } from "react-router-dom";
import { rewindTheme } from "./app/styles/theme";
import { AppInfoProvider } from "./app/providers/AppInfoProvider";
import { TheaterProvider } from "./app/providers/TheaterProvider";
import { createRewindTheater } from "./app/utils/creators/CommonManagers";

(async function () {
  // TODO: Set console.log to electron-logger
  // TODO: Initialize it within the <RewindApp/>?
  // TODO: Set rewindSkinsFolder to the one given by the app
  // const [appVersion, platform] = await Promise.all([frontendAPI.getAppVersion(), frontendAPI.getPlatform()]);
  const [appVersion, platform] = await Promise.all(["3.1.4", "linux"]);
  const appInfo = { appVersion, platform };
  const theater = createRewindTheater({ rewindSkinsFolder: "/home/me/Dev/rewind/resources/Skins" });

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
})();
