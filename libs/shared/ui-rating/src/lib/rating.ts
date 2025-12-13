import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'acme-rating',
  imports: [MatIconModule],
  templateUrl: './rating.html',
  styleUrl: './rating.scss',
})
export class Rating {
  readonly rating = input.required<number>();
  protected readonly ratingClass = computed(() => {
    const rating = this.rating();
    if (rating >= 8) {
      return 'rating-icon-high';
    } else if (rating >= 5) {
      return 'rating-icon-mid';
    } else {
      return 'rating-icon-low';
    }
  });
}
