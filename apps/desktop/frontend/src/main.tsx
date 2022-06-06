import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { store } from "./app/store";

import { RewindApp } from "./app/RewindApp";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { HashRouter } from "react-router-dom";
import { rewindTheme } from "./app/styles/theme";
import { TheaterProvider } from "./app/providers/TheaterProvider";
import { createRewindTheater } from "./app/services/common/CommonManagers";
import { frontendAPI } from "./app/api";

(async function() {
  // TODO: Initialize it within the <RewindApp/>?
  // TODO: Set rewindSkinsFolder to the one given by the app

  // Recommended way to use electron-log whenever we write console.log
  // TODO
  // Object.assign(console, log.functions);

  const [appVersion, appPlatform, rewindSkinsFolder] = await Promise.all([frontendAPI.getAppVersion(), frontendAPI.getPlatform(),
    "",
  ]);
  const theater = createRewindTheater({
    appVersion,
    appPlatform,
    rewindSkinsFolder,
  });

  console.log(`Booting Rewind application with ${JSON.stringify({ appVersion, appPlatform, rewindSkinsFolder })}`);

  ReactDOM.render(
    <StrictMode>
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
    </StrictMode>,
    document.getElementById("root"),
  );
})();
