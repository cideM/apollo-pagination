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

function App() {
  const [input, setInput] = useState("bus");

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

  const onClickNext = () => {
    fetchMore({
      variables: {
        limit: 2,
        after: get(data, "listFoos.pageInfo.endCursor"),
        query: input,
      },
    });
  };

  if (loading) return <p>Loading...</p>;
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
      {data && data.listFoos.pageInfo.hasNextPage && (
        <button onClick={onClickNext}>next</button>
      )}
      {data && (
        <ul>
          {data.listFoos.edges.map((edge) => {
            return <li key={edge.cursor}>{edge.cursor}</li>;
          })}
        </ul>
      )}
    </div>
  );
}

export default App;
