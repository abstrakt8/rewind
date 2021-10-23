import { AppInfoProvider, RewindTheme, TheaterProvider } from "@rewind/feature-replay-viewer";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";
import { WebTestApp } from "./app/webTestApp";
import { environment } from "./environments/environment";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createRewindTheater } from "@rewind/web-player/rewind";

// This project assumes that the backend is already initialized

const apiUrl = environment.url;
export const theater = createRewindTheater({ apiUrl });
theater.common.initialize();
theater.analyzer.initialize();

const appInfo = {
  appVersion: "0.1.0",
  platform: "Windows",
};

ReactDOM.render(
  <StrictMode>
    <AppInfoProvider appInfo={appInfo}>
      <TheaterProvider theater={theater}>
        <ThemeProvider theme={RewindTheme}>
          <CssBaseline />
          <WebTestApp />
        </ThemeProvider>
      </TheaterProvider>
    </AppInfoProvider>
  </StrictMode>,

  document.getElementById("root"),
);
