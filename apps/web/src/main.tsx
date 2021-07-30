import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { OsuExpressProvider } from "../../../libs/feature-replay-viewer/src/contexts/OsuExpressContext";

const url = "http://localhost:7271";

ReactDOM.render(
  <StrictMode>
    <OsuExpressProvider url={url}>
      <App />
    </OsuExpressProvider>
  </StrictMode>,

  document.getElementById("root"),
);
