import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';

import { EnrichedMovie } from '@acme/movies/util-movies';

import { MovieCard } from './movie-card';

@Component({
  selector: 'acme-movie-card-list',
  imports: [MovieCard],
  templateUrl: './movie-card-list.html',
  styleUrl: './movie-card-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardList {
  readonly selectedMovie = model<EnrichedMovie | undefined>(); // Two-way binding
  readonly selectedGenre = input<string>('');
  readonly movies = input<EnrichedMovie[]>([]);
  readonly highlightSelected = input<boolean>(true);

  protected selectMovie(movie: EnrichedMovie) {
    this.selectedMovie.update(() => movie);
  }
}
