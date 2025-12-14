/*
  This component was adapted from an example on the Angular Material website
  https://stackblitz.com/run?file=src%2Fexample%2Ftable-expandable-rows-example.ts&startScript=start
*/

import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { EnrichedMovie } from '@acme/movies/util-movies';
import { Rating } from '@acme/shared/ui-rating';

@Component({
  selector: 'acme-movie-table',
  imports: [
    Rating,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
  ],
  templateUrl: './movie-table.html',
  styleUrl: './movie-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieTable {
  readonly selectedMovie = model<EnrichedMovie | undefined>(); // Two-way binding
  readonly movies = input.required<EnrichedMovie[]>();
  readonly selectedGenre = input<string>('');

  protected readonly dataSource = computed(() =>
    this.movies().map((movie) => ({
      ...movie,
      genreTitles: movie.genres?.map((genre) => genre.title),
    }))
  );

  protected readonly columns = [
    { label: 'Score', field: 'ratingValue', isArray: false },
    { label: 'Title', field: 'title', isArray: false },
    { label: 'Year', field: 'releaseYear', isArray: false },
    { label: 'Rating', field: 'rating', isArray: false },
    { label: 'Duration', field: 'runningTime', isArray: false },
    { label: 'Genres', field: 'genreTitles', isArray: true },
    { label: 'Cast', field: 'mainActors', isArray: true },
    { label: 'Directors', field: 'directors', isArray: true },
    { label: 'Writers', field: 'writers', isArray: true },
  ];
  protected readonly columnsToDisplay = [
    ...this.columns.map(({ field }) => field),
    'expand',
  ];

  private expandedMovie: string | undefined;

  protected isExpanded({ id }: EnrichedMovie) {
    return this.expandedMovie === id;
  }

  protected toggle(movie: EnrichedMovie) {
    this.selectedMovie.update(() => movie);
    if (movie.posterUrl || movie.summary) {
      this.expandedMovie = this.isExpanded(movie) ? undefined : movie.id;
    } else {
      this.expandedMovie = undefined;
    }
  }
}
