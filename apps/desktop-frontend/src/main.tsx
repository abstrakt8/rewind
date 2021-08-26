import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { store, history } from "./app/store";
import { ConnectedRouter } from "connected-react-router";

import { TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";

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
      <ConnectedRouter history={history}>
        {/* place ConnectedRouter under Provider */}
        <TheaterProvider apiUrl={"http://localhost:7271"}>
          <RewindApp />
        </TheaterProvider>
      </ConnectedRouter>
    </Provider>
  </StrictMode>,
  document.getElementById("root"),
);
