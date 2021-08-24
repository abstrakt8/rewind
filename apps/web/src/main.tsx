import { TheaterProvider, store } from "@rewind/feature-replay-viewer";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { Provider } from "react-redux";

// TODO: process.env.URL
const url = "http://localhost:7271";

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
