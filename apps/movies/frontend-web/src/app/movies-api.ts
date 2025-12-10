import {
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  signal,
  TransferState,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable, of, tap } from 'rxjs';

import { MOVIES_API_URI } from './movies-api-injection-tokens';
import { toSignal } from '@angular/core/rxjs-interop';

const MOVIES_BY_GENRE = gql`
  query MoviesByGenre($where: MovieFilterInput, $pagination: PaginationInput) {
    movies(where: $where, pagination: $pagination) {
      nodes {
        title
      }
      pagination {
        page
        perPage
        totalPages
      }
    }
  }
`;

interface Genre {
  id?: string;
  title?: string;
}
interface Pagination {
  page: number;
  perPage: number;
  totalPages: number;
}
interface Movie {
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

interface MoviesQueryResponse {
  movies: {
    nodes: Movie[];
    pagination: Pagination;
  };
}

interface PaginationVariables {
  perPage?: number;
  page?: number;
}

interface MoviesQueryVariables {
  where?: {
    genre?: string;
    search?: string;
  };
  pagination?: PaginationVariables;
}

@Injectable({
  providedIn: 'root',
})
export class MoviesApi {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly moviesApiUrl = inject(MOVIES_API_URI);
  private readonly apollo = inject(Apollo);

  private readonly authTokenStateKey = makeStateKey<string>(
    'movies-api-auth-token.state'
  );

  private readonly authToken = toSignal(this.getAuthToken());

  private getAuthToken() {
    if (isPlatformServer(this.platformId)) {
      // Getting the token server-side allows to pass secret server credentials to the token endpoint in the future if necessary
      return this.http
        .get<{ token: string }>(`${this.moviesApiUrl}/auth/token`) // URL is defined in firebase environment variables
        .pipe(
          map((resp) => resp.token),
          tap((token) => this.transferState.set(this.authTokenStateKey, token))
        );
    } else {
      return of(this.transferState.get(this.authTokenStateKey, ''));
    }
  }

  moviesByGenre(genre: string, page = 1, perPage = 10) {
    return this.apollo.watchQuery<MoviesQueryResponse>({
      query: MOVIES_BY_GENRE,
      variables: {
        where: {
          genre,
        },
        pagination: {
          perPage,
          page,
        },
      },
      context: {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${this.authToken()}`
        ),
      },
    }).valueChanges;
  }
}
