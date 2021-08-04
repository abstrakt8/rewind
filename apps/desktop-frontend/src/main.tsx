import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";

interface API {
  send(channel: "toMain", data: unknown): unknown;
  receive(channel: "fromMain", func: unknown): unknown;
}

declare global {
  interface Window {
    api: API;
  }
}

// window.api.receive("fromMain", (data: string) => {
//   console.log(`Received data ${data}`);
// });

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root"),
);
