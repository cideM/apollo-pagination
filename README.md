# Quick Start

```shell
$ docker compose up --build
$ open http://localhost:5137/
```

This will start a Golang GraphQL server that is running at
`http://localhost:8080/query` and it will also start Vite in development mode.
You can access the website that it generates at `http://localhost:5137`. Hot
reloading should work just fine.

The issue this demonstrates is how to use pagination in combination with
`useLazyQuery`. If you load the page just click "next" and observe the network
requests. You'll see that it makes a network request that returns new edges,
but the app does not update.

