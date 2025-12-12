export interface Genre {
  id?: string;
  title?: string;
  movies?: Movie[];
}

export interface Pagination {
  page?: number;
  perPage?: number;
  totalPages?: number;
}

export interface Movie {
  id?: string;
  title?: string;
  bestRating?: number;
  datePublished?: string; //'2016-03-11'
  directors?: string[];
  duration?: string; //'PT1H43M';
  genres?: Genre[];
  mainActors?: string[];
  posterUrl?: string;
  rating?: string;
  ratingValue?: number;
  summary?: string;
  worstRating?: number;
  writers?: string[];
}

export interface MoviesQueryResponse {
  movies: {
    nodes: Movie[];
    pagination: Pagination;
  };
}

export interface GenresQueryResponse {
  genres: {
    nodes: Genre[];
  };
}

export interface GenreQueryResponse {
  genre: Genre | null;
}

export interface MovieQueryResponse {
  movie: Movie | null;
}

export type MoviesApiQueryResponse =
  | MoviesQueryResponse
  | GenresQueryResponse
  | GenreQueryResponse
  | MovieQueryResponse;

export interface PaginationInput {
  perPage?: number;
  page?: number;
}

export interface MovieFilterInput {
  genre?: string;
  search?: string; // partial title search
}

export interface IdQueryVariables {
  id: string;
}

export interface PaginationQueryVariables {
  pagination?: PaginationInput;
}
export type GenresQueryVariables = PaginationQueryVariables;
export interface MoviesQueryVariables extends PaginationQueryVariables {
  where?: MovieFilterInput;
}

export type MoviesApiQueryVariables =
  | MoviesQueryVariables
  | GenresQueryVariables
  | IdQueryVariables;
