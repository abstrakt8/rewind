import { RewindTheme, TheaterProvider } from "@rewind/feature-replay-viewer";
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

ReactDOM.render(
  <StrictMode>
    <TheaterProvider theater={theater}>
      <ThemeProvider theme={RewindTheme}>
        <CssBaseline />
        <WebTestApp />
      </ThemeProvider>
    </TheaterProvider>
  </StrictMode>,

  document.getElementById("root"),
);
