import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { store, history } from "./app/store";
import { ConnectedRouter, push } from "connected-react-router";

import { TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";
import { ElectronAPI, SecureElectronAPI } from "@rewind/electron/api";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: SecureElectronAPI;
  }
}

// This "polyfill" is only done so that desktop-frontend can also be opened in the browser (for testing).
if (!window.api) {
  window.api = {
    send: () => {},
    receive: (...args) => {
      return () => {};
    },
  };
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

store.dispatch(push("/setup"));
