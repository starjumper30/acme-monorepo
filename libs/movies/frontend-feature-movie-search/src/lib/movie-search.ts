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
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MovieCardList,
  ],
  templateUrl: './movie-search.html',
  styleUrl: './movie-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieSearch {
  moviesAPI = inject(MoviesApi);

  private readonly genreSignals = apolloResultToSignals<GenresQueryResponse>(
    this.moviesAPI.genres()
  );

  genres = computed(() => this.genreSignals.data()?.genres.nodes ?? []);
  isLoadingGenres = this.genreSignals.isLoading;
  genresLoadingError = this.genreSignals.error;

  selectedGenre = new FormControl({ value: '', disabled: true });
  pageSettings = signal({ page: 1, perPage: 9 });

  private readonly genreObservable = this.selectedGenre.valueChanges.pipe(
    startWith(''),
    distinctUntilChanged()
  );

  totalMovies = toSignal(
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

  movies = computed(
    () =>
      this.movieSignals
        .data()
        ?.movies?.nodes.map((movie) => toEnrichedMovie(movie)) ?? []
  );

  isLoadingMovies = this.movieSignals.isLoading;
  moviesLoadingError = this.movieSignals.error;

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
