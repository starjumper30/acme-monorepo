import { gql } from 'apollo-angular';

import {
  GenresQueryResponse,
  MoviesQueryResponse,
  MoviesQueryVariables,
} from '@acme/movies/util-movies';

// TODO figure out how to get the typing to work properly with the gql function
export const MOVIES_GQL = gql<MoviesQueryResponse, MoviesQueryVariables>`
  query Movies($where: MovieFilterInput, $pagination: PaginationInput) {
    movies(where: $where, pagination: $pagination) {
      nodes {
        id
        title
        summary
        posterUrl
        genres {
          title
        }
        bestRating
        datePublished
        directors
        duration
        mainActors
        rating
        ratingValue
        worstRating
        writers
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
