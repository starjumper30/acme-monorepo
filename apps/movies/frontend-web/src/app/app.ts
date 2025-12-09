import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MoviesApi } from './movies-api';
import { AsyncPipe } from '@angular/common';

@Component({
  imports: [RouterModule, AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  moviesAPI = inject(MoviesApi);

  token = this.moviesAPI.getAuthToken();
}
