import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MoviesApi } from '@acme/shared/frontend-data-access-movies';

@Component({
  imports: [RouterModule, AsyncPipe, JsonPipe],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  moviesAPI = inject(MoviesApi);

  movies = this.moviesAPI.moviesByGenre('action');
}
