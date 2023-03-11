package main

import (
	"context"
	_ "embed"
	"net/http"
	"sort"
	"strings"

	graphql "github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	"github.com/rs/cors"
)

type query struct{}

//go:embed schema.graphql
var schema string

type PageInfo struct {
	HasNextPage     bool
	HasPreviousPage bool
	StartCursor     *string
	EndCursor       *string
}

type FooEdge struct {
	Node   string
	Cursor string
}

type FooConnection struct {
	Edges    []FooEdge
	PageInfo PageInfo
}

var foos = []string{
  "bus brand",
  "bus driver",
  "bus factor",
  "bus line",
  "bus station",
  "bus stop",
  "bus terminal",
  "bus tires",
}

func (_ *query) ListFoos(_ context.Context, args struct {
	Query  string
	Limit  *int32
	Before *string
	After  *string
}) FooConnection {

	limit := len(foos)

	if args.Limit != nil {
		limit = int(*args.Limit)
	}

	edges := []FooEdge{}
	pageInfo := PageInfo{}

	filtered := []string{}
	for _, s := range foos {
		if strings.HasPrefix(s, args.Query) {
			filtered = append(filtered, s)
		}
	}

	if limit > len(filtered) {
		limit = len(filtered)
	}

	if args.After != nil {
		after := *args.After

		if after > filtered[0] {
			pageInfo.HasPreviousPage = true
		}

		for _, s := range filtered {
			if s > after && len(edges) < limit {
				edges = append(edges, FooEdge{s, s})
			}
		}

		sort.Slice(edges, func(i, j int) bool {
			return edges[i].Node < edges[j].Node
		})

		if len(edges) > 0 {
			if edges[len(edges)-1].Node < filtered[len(filtered)-1] {
				pageInfo.HasNextPage = true
			}
			pageInfo.EndCursor = &edges[len(edges)-1].Node
			pageInfo.StartCursor = &edges[0].Node
		}
	}

	if args.Before != nil {
		before := *args.Before

		if before < filtered[len(filtered)-1] {
			pageInfo.HasNextPage = true
		}

		for i := len(filtered) - 1; i >= 0; i-- {
			s := filtered[i]
			if s < before && len(edges) < limit {
				edges = append(edges, FooEdge{s, s})
			}
		}

		sort.Slice(edges, func(i, j int) bool {
			return edges[i].Node < edges[j].Node
		})

		if len(edges) > 0 {
			if edges[0].Node > filtered[0] {
				pageInfo.HasPreviousPage = true
			}
			pageInfo.EndCursor = &edges[len(edges)-1].Node
			pageInfo.StartCursor = &edges[0].Node
		}
	}

	if args.Before == nil && args.After == nil {
		for _, s := range filtered {
			if len(edges) < limit {
				edges = append(edges, FooEdge{s, s})
			}
		}

		sort.Slice(edges, func(i, j int) bool {
			return edges[i].Node < edges[j].Node
		})

		if len(edges) > 0 {
			if edges[0].Node > filtered[0] {
				pageInfo.HasPreviousPage = true
			}
			if edges[len(edges)-1].Node < filtered[len(filtered)-1] {
				pageInfo.HasNextPage = true
			}
			pageInfo.EndCursor = &edges[len(edges)-1].Node
			pageInfo.StartCursor = &edges[0].Node
		}
	}

	conn := FooConnection{
		Edges:    edges,
		PageInfo: pageInfo,
	}

	return conn
}

func main() {
	opts := []graphql.SchemaOpt{graphql.UseFieldResolvers()}
	gqlHandler := &relay.Handler{Schema: graphql.MustParseSchema(schema, &query{}, opts...)}

	mux := http.NewServeMux()
	mux.Handle("/query", gqlHandler)

	handler := cors.Default().Handler(mux)
	http.ListenAndServe(":8080", handler)
}
