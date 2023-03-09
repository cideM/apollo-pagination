import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        listFoos: {
          // Don't cache separate results based on
          // any of this field's arguments.
          keyArgs: false,

          // Concatenate the incoming list items with
          // the existing list items.
          merge(existing = [], incoming) {
            console.table("merge called", incoming)
            if (incoming) {
              return [...incoming.edges];
            }
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

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
