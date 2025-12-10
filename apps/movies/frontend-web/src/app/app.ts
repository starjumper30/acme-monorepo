import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MoviesApi } from './movies-api';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { shareReplay, switchMap, tap } from 'rxjs';

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
