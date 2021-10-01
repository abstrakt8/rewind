import { RewindTheme, TheaterProvider } from "@rewind/feature-replay-viewer";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";
import { WebTestApp } from "./app/webTestApp";
import { environment } from "./environments/environment";
import { CssBaseline, ThemeProvider } from "@mui/material";

// TODO: process.env.URL
const url = environment.url;

ReactDOM.render(
  <StrictMode>
    <TheaterProvider apiUrl={url}>
      <ThemeProvider theme={RewindTheme}>
        <CssBaseline />
        <WebTestApp />
      </ThemeProvider>
    </TheaterProvider>
  </StrictMode>,

  document.getElementById("root"),
);
