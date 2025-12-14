import { Component, inject, input } from '@angular/core';
import { EnrichedMovie, toEnrichedMovie } from '@acme/movies/util-movies';
import { MoviesAiRecommendations } from '@acme/movies/frontend-data-access-firebase';
import { MovieCardList } from '@acme/movies/ui-movie-card';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { MoviesApi } from '@acme/movies/frontend-data-access-movies';

interface RecommendationData {
  title: string;
  genre: string;
  message: string;
  results: EnrichedMovie[];
  titles: string[];
}

@Component({
  selector: 'acme-movie-recommendations',
  imports: [MovieCardList],
  templateUrl: './movie-recommendations.html',
  styleUrl: './movie-recommendations.scss',
})
export class MovieRecommendations {
  private readonly moviesAPI = inject(MoviesApi);
  private readonly aiService = inject(MoviesAiRecommendations);

  selectedMovie = input<string>('');
  selectedGenre = input<string>('');

  // this prevents extra calls to the AI service when the component is not active
  active = input<boolean>(false);

  private lastRecommendationData: RecommendationData | undefined;

  protected readonly recommendations = toSignal(
    combineLatest([
      toObservable(this.selectedMovie).pipe(distinctUntilChanged()),
      toObservable(this.selectedGenre).pipe(distinctUntilChanged()),
      toObservable(this.active).pipe(distinctUntilChanged()),
    ]).pipe(
      filter(([title, genre, active]) => {
        if (!active) {
          return false;
        }
        if (!title || !genre) {
          return false;
        }
        //  make sure we haven't already loaded these results
        return !(
          this.lastRecommendationData?.genre === genre &&
          this.lastRecommendationData?.title === title
        );
      }),
      map(
        ([title, genre]) =>
          ({
            title,
            genre,
            message: `Loading recommendations for genre ${genre} that are similar to "${title}"...`,
            results: [],
            titles: [],
          } as RecommendationData)
      ),
      switchMap((recommendationData) =>
        from(
          this.aiService.getRecommendations(
            recommendationData.genre,
            recommendationData.title
          )
        ).pipe(
          map((titles) => ({ ...recommendationData, titles })),
          startWith(recommendationData),
          catchError((e) => {
            console.log('Failed to get recommendations from AI', e);
            return of({
              ...recommendationData,
              message: 'Failed to get recommendations from AI',
            });
          })
        )
      ),
      switchMap((recommendationData) =>
        recommendationData.titles.length
          ? this.moviesAPI.moviesByTitlesSearch(recommendationData.titles).pipe(
              map((response) => {
                if (!response.loading) {
                  const finalData = {
                    ...recommendationData,
                    results:
                      response.data?.movies?.nodes?.map((movie) =>
                        toEnrichedMovie(movie)
                      ) ?? [],
                    message: `Recommendations for genre ${this.selectedGenre()} that are similar to "${this.selectedMovie()}"`,
                  };
                  this.lastRecommendationData = finalData;
                  return finalData;
                }
                return recommendationData;
              }),
              catchError((e) => {
                console.log('Failed to load recommendations', e);
                return of({
                  ...recommendationData,
                  message: 'Failed to load recommendations from movies API.',
                });
              })
            )
          : of(recommendationData)
      )
    )
  );
}
