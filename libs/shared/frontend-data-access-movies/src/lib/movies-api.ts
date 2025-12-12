import { isPlatformServer } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql/language';
import { catchError, map, of, shareReplay, switchMap, take, tap } from 'rxjs';

import { MOVIES_API_URI } from './movies-api-injection-tokens';
import {
  GenresQueryResponse,
  GenresQueryVariables,
  MovieFilterInput,
  MoviesApiQueryResponse,
  MoviesApiQueryVariables,
  MoviesQueryResponse,
  MoviesQueryVariables,
} from './movies-schema';
import { GENRES_GQL, MOVIES_GQL } from './movies-gql';

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

  private readonly context = this.getAuthToken().pipe(
    shareReplay(1),
    map((authToken) => ({
      headers: new HttpHeaders().set('Authorization', `Bearer ${authToken}`),
    }))
  );

  constructor() {
    this.context.pipe(take(1)).subscribe(() => {
      /* no-op just making sure auth token is requested as soon as the MoviesApi is constructed.
       * Later subscribers will get the prefetched value because of the shareReplay operator.
       *  */
    });
  }

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

  customQuery<
    T extends MoviesApiQueryResponse,
    V extends MoviesApiQueryVariables
  >(query: DocumentNode, variables: V) {
    return this.context.pipe(
      switchMap((context) =>
        this.apollo
          .watchQuery<T, V>({
            query,
            variables,
            context,
          })
          .valueChanges.pipe(
            catchError((error) =>
              of({ error, data: undefined, loading: false })
            )
          )
      )
    );
  }

  genres() {
    return this.customQuery<GenresQueryResponse, GenresQueryVariables>(
      GENRES_GQL,
      {}
    );
  }

  movies(filter: MovieFilterInput = {}, page = 1, perPage = 10) {
    return this.customQuery<MoviesQueryResponse, MoviesQueryVariables>(
      MOVIES_GQL,
      {
        pagination: { perPage, page },
        where: filter,
      }
    );
  }

  moviesByGenre(genre: string, page = 1, perPage = 10) {
    return this.movies({ genre }, page, perPage);
  }

  moviesByTitleSearch(search: string, page = 1, perPage = 10) {
    return this.movies({ search }, page, perPage);
  }
}
