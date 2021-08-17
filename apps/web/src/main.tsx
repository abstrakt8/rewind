// TODO: Should only be imported once
import "reflect-metadata";

import { TheaterProvider } from "@rewind/feature-replay-viewer";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { io } from "socket.io-client";
import { Provider } from "react-redux";
import store from "../../../libs/feature-replay-viewer/src/store";

// TODO: process.env.URL
const url = "http://localhost:7271";

const socket = io(url);
socket.on("connect", () => {
  console.log("Connected to WebSocket");
});

const reducer = {};

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <TheaterProvider apiUrl={url}>
        <App />
      </TheaterProvider>
    </Provider>
  </StrictMode>,

  document.getElementById("root"),
);
