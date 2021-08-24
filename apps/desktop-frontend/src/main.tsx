import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { TheaterProvider, store } from "@rewind/feature-replay-viewer";
import { Provider } from "react-redux";

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
    <Provider store={store}>
      <TheaterProvider apiUrl={"http://localhost:7271"}>
        <App />
      </TheaterProvider>
    </Provider>
  </StrictMode>,
  document.getElementById("root"),
);
