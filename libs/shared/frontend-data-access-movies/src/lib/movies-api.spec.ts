import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PLATFORM_ID, TransferState } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { MoviesApi } from './movies-api';
import { MOVIES_API_URI } from './movies-api-injection-tokens';
import { provideHttpClient } from '@angular/common/http';

// TODO expand tests to properly test all server-side and browser-side behavior
describe('MoviesApi', () => {
  let service: MoviesApi;
  let httpMock: HttpTestingController;
  let transferState: TransferState;
  let apollo: jest.Mocked<Apollo>;

  const mockMoviesApiUrl = 'https://test-api.example.com';
  const mockAuthToken = 'test-auth-token-123';

  describe('platformServer', () => {
    beforeEach(() => {
      const apolloMock = {
        watchQuery: jest.fn(),
      };

      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' },
          provideHttpClient(),
          provideHttpClientTesting(),
          MoviesApi,
          { provide: MOVIES_API_URI, useValue: mockMoviesApiUrl },
          { provide: Apollo, useValue: apolloMock },
          TransferState,
        ],
      });

      service = TestBed.inject(MoviesApi);
      httpMock = TestBed.inject(HttpTestingController);
      transferState = TestBed.inject(TransferState);
      apollo = TestBed.inject(Apollo) as jest.Mocked<Apollo>;
    });

    afterEach(() => {
      httpMock.verify();
    });

    describe('getAuthToken', () => {
      it('should fetch auth token on service creation', () => {
        // The authToken is fetched during service initialization
        // Expect the HTTP request to be made
        const req = httpMock.expectOne(`${mockMoviesApiUrl}/auth/token`);
        expect(req.request.method).toBe('GET');

        req.flush({ token: mockAuthToken });

        // Verify the token is stored in TransferState
        const stateKey = 'movies-api-auth-token.state';
        expect(transferState.hasKey(stateKey as any)).toBe(true);
      });
    });

    describe('moviesByGenre', () => {
      it('should call apollo watchQuery with correct parameters', (done) => {
        const genre = 'Action';
        const page = 2;
        const perPage = 20;

        const mockResponse = {
          data: {
            movies: {
              nodes: [{ title: 'Test Movie 1' }, { title: 'Test Movie 2' }],
              pagination: {
                page: 2,
                perPage: 20,
                totalPages: 5,
              },
            },
          },
          loading: false,
          networkStatus: 7,
        };

        apollo.watchQuery.mockReturnValue({
          valueChanges: of(mockResponse),
        } as any);

        // First, flush the auth token request
        const authReq = httpMock.expectOne(`${mockMoviesApiUrl}/auth/token`);
        authReq.flush({ token: mockAuthToken });

        // Now call the method
        service.moviesByGenre(genre, page, perPage).subscribe((result) => {
          expect(result).toEqual(mockResponse);
          expect(apollo.watchQuery).toHaveBeenCalledWith({
            query: expect.any(Object),
            variables: {
              where: {
                genre: 'Action',
              },
              pagination: {
                perPage: 20,
                page: 2,
              },
            },
            context: {
              headers: expect.objectContaining({}),
            },
          });
          done();
        });
      });

      it('should use default pagination values when not provided', (done) => {
        const genre = 'Comedy';

        const mockResponse = {
          data: {
            movies: {
              nodes: [{ title: 'Comedy Movie' }],
              pagination: {
                page: 1,
                perPage: 10,
                totalPages: 1,
              },
            },
          },
          loading: false,
          networkStatus: 7,
        };

        apollo.watchQuery.mockReturnValue({
          valueChanges: of(mockResponse),
        } as any);

        // Flush the auth token request
        const authReq = httpMock.expectOne(`${mockMoviesApiUrl}/auth/token`);
        authReq.flush({ token: mockAuthToken });

        service.moviesByGenre(genre).subscribe(() => {
          expect(apollo.watchQuery).toHaveBeenCalledWith(
            expect.objectContaining({
              variables: {
                where: { genre: 'Comedy' },
                pagination: {
                  perPage: 10,
                  page: 1,
                },
              },
            })
          );
          done();
        });
      });

      it('should include authorization header with bearer token', (done) => {
        const genre = 'Drama';

        apollo.watchQuery.mockReturnValue({
          valueChanges: of({ data: { movies: { nodes: [], pagination: {} } } }),
        } as any);

        // Flush the auth token request
        const authReq = httpMock.expectOne(`${mockMoviesApiUrl}/auth/token`);
        authReq.flush({ token: mockAuthToken });

        service.moviesByGenre(genre).subscribe(() => {
          const callArgs = apollo.watchQuery.mock.calls[0][0];
          const headers = callArgs.context?.['headers'];

          expect(headers.get('Authorization')).toBe(`Bearer ${mockAuthToken}`);
          done();
        });
      });
    });
  });
});
