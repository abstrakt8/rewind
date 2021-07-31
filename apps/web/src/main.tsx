import { StrictMode } from "react";
import * as ReactDOM from "react-dom";

import App from "./app/app";
import { OsuExpressProvider } from "../../../libs/feature-replay-viewer/src/contexts/OsuExpressContext";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { MobXProvider } from "../../../libs/feature-replay-viewer/src/contexts/MobXContext";

const url = "http://localhost:7271";
const client = new ApolloClient({
  uri: "http://localhost:7271/graphql",
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <StrictMode>
    <ApolloProvider client={client}>
      <OsuExpressProvider url={url}>
        <MobXProvider>
          <App />
        </MobXProvider>
      </OsuExpressProvider>
    </ApolloProvider>
  </StrictMode>,

  document.getElementById("root"),
);
