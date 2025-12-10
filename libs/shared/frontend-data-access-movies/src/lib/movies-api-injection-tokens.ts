import { InjectionToken } from '@angular/core';
import { InMemoryCache } from '@apollo/client';

export const MOVIES_APOLLO_CACHE = new InjectionToken<InMemoryCache>(
  'apollo-cache'
);
export const MOVIES_API_URI = new InjectionToken<string>('movies-api-uri');
