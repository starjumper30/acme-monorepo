import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { EnrichedMovie } from './enriched-movie';
import { MovieCard } from './movie-card';

@Component({
  selector: 'acme-movie-search-results-list',
  imports: [MovieCard],
  templateUrl: './movie-search-results-list.html',
  styleUrl: './movie-search-results-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieSearchResultsList {
  selectedGenre = input<string>('');
  movies = input<EnrichedMovie[]>([]);
}
