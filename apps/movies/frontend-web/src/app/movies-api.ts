import {
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MoviesApi {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly authTokenKey = makeStateKey<string>('movies-api-auth-token');

  getAuthToken() {
    if (isPlatformServer(this.platformId)) {
      // Getting the token server-side allows to pass secret server credentials to the token endpoint in the future if necessary
      return this.http
        .get<{ token: string }>(`${process.env['MOVIES_API_URL']}/auth/token`)
        .pipe(
          map((resp) => resp.token),
          tap((token) => {
            this.transferState.set(this.authTokenKey, token);
          })
        );
    } else {
      return of(this.transferState.get(this.authTokenKey, ''));
    }
  }
}
