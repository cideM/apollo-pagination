import { useState, useCallback, useEffect } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import debounce from "lodash/debounce";
import get from "lodash/get";
import "./App.css";

const GET_FOOS = gql`
  query GetFoos($limit: Int, $after: String, $before: String, $query: String!) {
    listFoos(query: $query, limit: $limit, after: $after, before: $before) {
      edges {
        node
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

type Foo = string;

interface FooEdge {
  node: Foo;
  cursor: string;
}

function App() {
  const [input, setInput] = useState("bus");

  // Whenever the user is done typing into the input field, we load new
  // results. For this we use "useLazyQuery", cache the function call with
  // "useCallback", and invoke it inside of the "useEffect" below.
  const [loadFoos, { loading, error, data, fetchMore }] =
    useLazyQuery(GET_FOOS);

  const debouncedLoad: (input: string) => any = useCallback(
    debounce((input: string) => {
      loadFoos({
        variables: {
          limit: 2,
          query: input,
        },
      });
    }, 200),
    []
  );

  useEffect(() => {
    debouncedLoad(input);
  }, [input]);

  const onClickPrevious = () => {
    fetchMore({
      variables: {
        limit: 2,
        before: get(data, "listFoos.pageInfo.startCursor"),
        query: input,
      },
    });
  };

  const onClickNext = () => {
    fetchMore({
      variables: {
        limit: 2,
        after: get(data, "listFoos.pageInfo.endCursor"),
        query: input,
      },
    });
  };

  if (error) return <p>Error : {error.message}</p>;

  return (
    <div className="App">
      <input
        type="text"
        name="query"
        onChange={(event) => {
          setInput(event.currentTarget.value);
        }}
        value={input}
      />
      {loading && <p>Loading...</p>}
      {!loading && data && data.listFoos.pageInfo.hasPreviousPage && (
        <button onClick={onClickPrevious}>previous</button>
      )}
      {!loading && data && data.listFoos.pageInfo.hasNextPage && (
        <button onClick={onClickNext}>next</button>
      )}
      {!loading && data && (
        <ul>
          {data.listFoos.edges.map((edge: FooEdge) => {
            return <li key={edge.cursor}>{edge.cursor}</li>;
          })}
        </ul>
      )}
    </div>
  );
}

export default App;
