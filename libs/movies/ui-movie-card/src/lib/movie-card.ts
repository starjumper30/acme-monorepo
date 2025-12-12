import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { EnrichedMovie } from '@acme/movies/util-movies';

@Component({
  selector: 'acme-movie-card',
  imports: [MatCardModule, MatIconModule, MatChipsModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCard {
  movie = input.required<EnrichedMovie>();
  selectedGenre = input<string>('');
}
