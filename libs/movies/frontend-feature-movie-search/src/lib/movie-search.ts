import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  GenresQueryResponse,
  MoviesApi,
  MoviesQueryResponse,
} from '@acme/shared/frontend-data-access-movies';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  distinctUntilChanged,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { apolloResultToSignals } from '@acme/shared/frontend-data-access-apollo';

@Component({
  selector: 'acme-movie-search',
  imports: [ReactiveFormsModule],
  templateUrl: './movie-search.html',
  styleUrl: './movie-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieSearch {
  moviesAPI = inject(MoviesApi);

  // TODO how do I get this call to be made only during the server-side rendering?
  private readonly genreSignals = apolloResultToSignals<GenresQueryResponse>(
    this.moviesAPI.genres()
  );

  genres = computed(() => this.genreSignals.data()?.genres.nodes ?? []);
  isLoadingGenres = this.genreSignals.isLoading;
  genresLoadingError = this.genreSignals.error;

  selectedGenre = new FormControl('');

  private readonly movieSignals = apolloResultToSignals<MoviesQueryResponse>(
    this.selectedGenre.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap((value) =>
        this.moviesAPI.movies(value ? { genre: value } : undefined).pipe(
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

  movies = computed(() => this.movieSignals.data()?.movies?.nodes ?? []);
  isLoadingMovies = this.movieSignals.isLoading;
  moviesLoadingError = this.movieSignals.error;

  hasErrors = computed(
    () => !!(this.genresLoadingError() || this.moviesLoadingError())
  );
}
