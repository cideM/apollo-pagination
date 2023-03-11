# Quick Start

```shell
$ docker compose up --build
$ open http://localhost:5137/
```

This will start a Golang GraphQL server that is running at
`http://localhost:8080/query` and it will also start Vite in development mode.
You can access the website that it generates at `http://localhost:5137`. Hot
reloading should work just fine.

# What's the Problem

The issue this repository demonstrates is how to use pagination in combination
with `useLazyQuery`. If you load the page, just click "next" and observe the
network requests. You'll see that it makes a network request that returns new
edges, but the app does not update.

Here are the steps to reproduce the issue:
1. `docker compose up --build`
2. `open http://localhost:5137/`
3. Open network tab in browser
4. Click "next"

The `POST` request returns the following two edges:
* `{ node: "bus station", cursor: "bus station", __typename: "FooEdge" }`
* `{ node: "bus terminal", cursor: "bus terminal", __typename: "FooEdge" }`

The app does not update though and still shows the first two edges.

# Requirements

When the app loads, "bus" is already entered into the input field.

When a user now clicks "next", the list should show the following, two results:
* bus station
* bus terminal

When a user clicks "next" again, the list should show the following result:
* bus tires

# Solution

By adding `["query"]` to the list of `keyArgs` Apollo now correctly updates the
cache. Furthermore, make sure to return `incoming` and not `incoming.edges`
from the `merge` function.
