import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Provider } from "react-redux";
import { store } from "./app/store";

import { RewindApp } from "./app/RewindApp";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { HashRouter } from "react-router-dom";
import { rewindTheme } from "./app/styles/theme";
import { TheaterProvider } from "./app/providers/TheaterProvider";
import { createRewindTheater } from "./app/services/common/CommonManagers";
import { frontendAPI } from "./app/api";
import log from "electron-log";
import { join } from "path";

(async function() {
  // Recommended way to use electron-log whenever we write console.log
  Object.assign(console, log.functions);

  const [appVersion, appPlatform, appResourcesPath] = await Promise.all([
    frontendAPI.getAppVersion(),
    frontendAPI.getPlatform(),
    frontendAPI.getPath("appResources"),
  ]);
  const rewindSkinsFolder = join(appResourcesPath, "Skins");

  console.log(`Booting Rewind application with ${JSON.stringify({ appVersion, appPlatform, rewindSkinsFolder })}`);

  const theater = createRewindTheater({
    appVersion,
    appPlatform,
    rewindSkinsFolder,
  });

  const container = document.getElementById("root") as HTMLElement;
  const root = createRoot(container);
  root.render(
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
  );
})();
