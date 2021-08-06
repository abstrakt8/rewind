import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { MobXProvider } from "../../../libs/feature-replay-viewer/src/react/contexts/MobXContext";

const url = "http://localhost:7271";

ReactDOM.render(
  <StrictMode>
    <MobXProvider url={url}>
      <App />
    </MobXProvider>
  </StrictMode>,

  document.getElementById("root"),
);
