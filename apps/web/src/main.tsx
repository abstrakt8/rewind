import { MobXProvider } from "@rewind/feature-replay-viewer";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { io } from "socket.io-client";

const url = "http://localhost:7271";

const socket = io(url);
socket.on("connect", () => {
  console.log("Connected to WebSocket");
});

ReactDOM.render(
  <StrictMode>
    <MobXProvider url={url} socket={socket}>
      <App />
    </MobXProvider>
  </StrictMode>,

  document.getElementById("root"),
);
