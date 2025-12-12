import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
  selectedGenre = input<string>('');
  movies = input<EnrichedMovie[]>([]);
}
