import { Route } from '@angular/router';

import { MovieSearch } from '@acme/movies/frontend-feature-movie-search';

export const appRoutes: Route[] = [
  { path: '', component: MovieSearch },
  { path: 'search', component: MovieSearch },
];
