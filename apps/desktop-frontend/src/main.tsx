import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { store, history } from "./app/store";
import { ConnectedRouter } from "connected-react-router";

import { TheaterProvider } from "@rewind/feature-replay-viewer";
import { RewindApp } from "./app/RewindApp";
import { ElectronAPI, SecureElectronAPI } from "@rewind/electron/api";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: SecureElectronAPI;
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
