import { TheaterProvider } from "@rewind/feature-replay-viewer";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";
import { WebTestApp } from "./app/webTestApp";

// TODO: process.env.URL
const url = "http://localhost:7271";

ReactDOM.render(
  <StrictMode>
    <TheaterProvider apiUrl={url}>
      <WebTestApp />
    </TheaterProvider>
  </StrictMode>,

  document.getElementById("root"),
);
