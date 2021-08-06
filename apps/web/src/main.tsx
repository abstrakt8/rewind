import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";

const url = "http://localhost:7271";

ReactDOM.render(
  <StrictMode>
    <OsuExpressProvider url={url}>
      <MobXProvider>
        <App />
      </MobXProvider>
    </OsuExpressProvider>
  </StrictMode>,

  document.getElementById("root"),
);
