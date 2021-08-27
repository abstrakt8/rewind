import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { store, history } from "./app/store";
import { ConnectedRouter, push } from "connected-react-router";

import { TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";
import { ElectronAPI, SecureElectronAPI } from "@rewind/electron/api";
import { EventEmitter2 } from "eventemitter2";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: SecureElectronAPI;
    eventEmitter: EventEmitter2;
  }
}

// This "polyfill" is only done so that desktop-frontend can also be opened in the browser (for testing).
window.eventEmitter = new EventEmitter2();
if (!window.api) {
  window.api = {
    send: (channel, ...args) => {
      console.log(`Channel=${channel}, Args = ${args}`);
    },
    receive: (channel, func) => {
      window.eventEmitter.on(channel, func);
      return () => window.eventEmitter.off(channel, func);
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
