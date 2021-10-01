import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { history, store } from "./app/store";
import { ConnectedRouter, push } from "connected-react-router";

import { TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";
import { FrontendPreloadAPI } from "@rewind/electron/api";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { RewindTheme } from "@rewind/feature-replay-viewer";

declare global {
  interface Window {
    api: FrontendPreloadAPI;
  }
}

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ThemeProvider theme={RewindTheme}>
          <CssBaseline />
          <TheaterProvider apiUrl={"http://localhost:7271"}>
            <RewindApp />
          </TheaterProvider>
        </ThemeProvider>
      </ConnectedRouter>
    </Provider>
  </StrictMode>,
  document.getElementById("root"),
);

// TODO: Maybe not here -> initial State ?
store.dispatch(push("/analyzer"));
