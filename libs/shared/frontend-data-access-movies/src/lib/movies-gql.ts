import { gql } from 'apollo-angular';
import {
  GenresQueryResponse,
  MoviesQueryResponse,
  MoviesQueryVariables,
} from './movies-schema';

// TODO figure out how to get the typing to work properly with the gql function
export const MOVIES_GQL = gql<MoviesQueryResponse, MoviesQueryVariables>`
  query Movies($where: MovieFilterInput, $pagination: PaginationInput) {
    movies(where: $where, pagination: $pagination) {
      nodes {
        title
        summary
        genres {
          title
        }
      }
      pagination {
        page
        perPage
        totalPages
      }
    }
  }
`;

export const GENRES_GQL = gql<GenresQueryResponse, void>`
  query Genres {
    genres {
      nodes {
        title
      }
    }
  }
`;
