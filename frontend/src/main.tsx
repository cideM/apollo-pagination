import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        listFoos: {
          // Don't cache separate results based on
          // any of this field's arguments.
          keyArgs: ["query"],

          // Concatenate the incoming list items with
          // the existing list items.
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  uri: "http://localhost:8080/query",
  cache,
});

const $root = document.getElementById("root");
if ($root) {
  const reactRoot = ReactDOM.createRoot($root);

  reactRoot.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
} else {
  throw new Error("no #root element found");
}
