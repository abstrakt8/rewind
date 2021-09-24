import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { TheaterProvider } from "@rewind/feature-replay-viewer";

const url = "http://localhost:7271";
ReactDOM.render(
  <StrictMode>
    <TheaterProvider apiUrl={url}>
      <App />
    </TheaterProvider>
  </StrictMode>,
  document.getElementById("root"),
);
