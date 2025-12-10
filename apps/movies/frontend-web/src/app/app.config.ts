import {
  ApplicationConfig,
  inject,
  makeStateKey,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  TransferState,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { isPlatformBrowser } from '@angular/common';
import {
  MOVIES_API_URI,
  MOVIES_APOLLO_CACHE,
} from './movies-api-injection-tokens';

const MOVIES_APOLLO_STATE_KEY =
  makeStateKey<NormalizedCacheObject>('apollo.state');

const MOVIES_API_URI_STATE_KEY = makeStateKey<string>('movies-api-uri.state');

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    { provide: MOVIES_APOLLO_CACHE, useValue: new InMemoryCache() },

    // TODO: If we have a lot of env variables, consider storing them together with one state key/injection token
    {
      provide: MOVIES_API_URI,
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);
        const transferState = inject(TransferState);
        const isBrowser = isPlatformBrowser(platformId);
        if (isBrowser) {
          return transferState.get(MOVIES_API_URI_STATE_KEY, '');
        } else {
          const url = process.env['MOVIES_API_URL'] ?? '';
          transferState.set(MOVIES_API_URI_STATE_KEY, url);
          return url;
        }
      },
    },

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const cache = inject(MOVIES_APOLLO_CACHE);
      const uri = `${inject(MOVIES_API_URI)}/graphql`;
      const transferState = inject(TransferState);
      const platformId = inject(PLATFORM_ID);
      const isBrowser = isPlatformBrowser(platformId);

      if (isBrowser) {
        const state = transferState.get(MOVIES_APOLLO_STATE_KEY, {});
        cache.restore(state);
      } else {
        transferState.onSerialize(MOVIES_APOLLO_STATE_KEY, () => {
          const result = cache.extract();
          // Reset cache after extraction to avoid sharing between requests
          cache.reset();
          return result;
        });
      }

      return {
        link: httpLink.create({ uri }),
        cache: cache,
        ...(isBrowser
          ? {
              ssrForceFetchDelay: 100,
            }
          : {
              ssrMode: true,
            }),
      };
    }),
  ],
};
