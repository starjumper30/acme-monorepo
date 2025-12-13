import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { MoviesApi } from '@acme/movies/frontend-data-access-movies';
import { MovieCardList } from '@acme/movies/ui-movie-card';
import { MovieTable } from '@acme/movies/ui-movie-table';
import {
  GenresQueryResponse,
  MoviesQueryResponse,
  toEnrichedMovie,
} from '@acme/movies/util-movies';
import { apolloResultToSignals } from '@acme/shared/frontend-data-access-apollo';

@Component({
  selector: 'acme-movie-search',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MovieCardList,
    MovieTable,
  ],
  templateUrl: './movie-search.html',
  styleUrl: './movie-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieSearch {
  private readonly moviesAPI = inject(MoviesApi);

  private readonly genreSignals = apolloResultToSignals<GenresQueryResponse>(
    this.moviesAPI.genres()
  );

  protected readonly genres = computed(
    () => this.genreSignals.data()?.genres.nodes ?? []
  );
  protected readonly isLoadingGenres = this.genreSignals.isLoading;
  protected readonly genresLoadingError = this.genreSignals.error;

  protected readonly selectedGenre = new FormControl({
    value: '',
    disabled: true,
  });
  protected readonly pageSettings = signal({ page: 1, perPage: 9 });

  private readonly genreObservable = this.selectedGenre.valueChanges.pipe(
    startWith(''),
    distinctUntilChanged()
  );

  protected readonly totalMovies = toSignal(
    this.genreObservable.pipe(
      // reset to first page when genre changes
      tap(() =>
        this.pageSettings.update(({ perPage }) => ({ perPage, page: 1 }))
      ),
      switchMap((genre) =>
        this.moviesAPI.movies(genre ? { genre } : undefined, 1, 1).pipe(
          map((response) => response.data?.movies?.pagination?.totalPages ?? 0),
          catchError((error) => {
            console.log(error);
            return of(0);
          })
        )
      )
    )
  );

  private readonly movieSignals = apolloResultToSignals<MoviesQueryResponse>(
    combineLatest([
      this.genreObservable.pipe(debounceTime(1)), // debounce here prevents a wasted call when user changes genre from a page other than page 1
      toObservable(this.pageSettings),
    ]).pipe(
      switchMap(([genre, { page, perPage }]) =>
        this.moviesAPI
          .movies(genre ? { genre } : undefined, page, perPage)
          .pipe(
            catchError((error) => {
              console.log(error);
              return of({
                error,
                loading: false,
                data: undefined,
              });
            })
          )
      )
    )
  );

  protected readonly movies = computed(
    () =>
      this.movieSignals
        .data()
        ?.movies?.nodes?.map((movie) => toEnrichedMovie(movie)) ?? []
  );

  protected readonly isLoadingMovies = this.movieSignals.isLoading;
  protected readonly moviesLoadingError = this.movieSignals.error;

  protected viewType: 'card' | 'table' = 'card';

  constructor() {
    effect(() => {
      if (!this.isLoadingGenres() && !this.genresLoadingError()) {
        this.selectedGenre.enable();
      }
    });
  }

  protected onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.pageSettings.set({ page: pageIndex + 1, perPage: pageSize });
  }
}
