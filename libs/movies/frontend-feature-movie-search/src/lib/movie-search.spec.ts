import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { of, throwError } from 'rxjs';

import { MoviesApi } from '@acme/movies/frontend-data-access-movies';
import { MovieCardList } from '@acme/movies/ui-movie-card';
import { MovieTable } from '@acme/movies/ui-movie-table';

import { MovieSearch } from './movie-search';

describe('MovieSearch', () => {
  let component: MovieSearch;
  let fixture: ComponentFixture<MovieSearch>;
  let moviesApi: jest.Mocked<MoviesApi>;

  const mockGenresResponse = {
    data: {
      genres: {
        nodes: [
          { id: '1', title: 'Action' },
          { id: '2', title: 'Comedy' },
          { id: '3', title: 'Drama' },
        ],
      },
    },
    loading: false,
    error: undefined,
  };

  const mockMoviesResponse = {
    data: {
      movies: {
        nodes: [
          {
            id: '1',
            title: 'Test Movie 1',
            genres: [{ title: 'Action' }],
            ratingValue: 8.5,
            datePublished: '2023-01-01',
          },
          {
            id: '2',
            title: 'Test Movie 2',
            genres: [{ title: 'Comedy' }],
            ratingValue: 7.2,
            datePublished: '2022-12-31',
          },
        ],
        pagination: {
          page: 1,
          perPage: 9,
          totalPages: 10,
        },
      },
    },
    loading: false,
    error: undefined,
  };

  const mockTotalMoviesResponse = {
    data: {
      movies: {
        pagination: {
          totalPages: 90,
        },
      },
    },
  };

  beforeEach(async () => {
    const moviesApiMock = {
      genres: jest.fn(),
      movies: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        MovieSearch,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSelectModule,
        MovieCardList,
        MovieTable,
      ],
      providers: [{ provide: MoviesApi, useValue: moviesApiMock }],
    }).compileComponents();

    moviesApi = TestBed.inject(MoviesApi) as jest.Mocked<MoviesApi>;
    moviesApi.genres.mockReturnValue(of(mockGenresResponse as any));
    moviesApi.movies.mockReturnValue(of(mockMoviesResponse as any));

    fixture = TestBed.createComponent(MovieSearch);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Genres Loading', () => {
    it('should load genres on initialization', () => {
      fixture.detectChanges();

      expect(moviesApi.genres).toHaveBeenCalled();
      expect(component['genres']()).toEqual(
        mockGenresResponse.data.genres.nodes
      );
    });

    it('should enable genre select when genres are loaded', () => {
      fixture.detectChanges();

      expect(component['selectedGenre'].disabled).toBe(false);
    });

    it('should keep genre select disabled when genres are loading', () => {
      const loadingResponse = { ...mockGenresResponse, loading: true };
      moviesApi.genres.mockReturnValue(of(loadingResponse as any));

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['selectedGenre'].disabled).toBe(true);
    });

    it('should keep genre select disabled when there is an error loading genres', () => {
      const errorResponse = {
        ...mockGenresResponse,
        error: new Error('Failed to load genres'),
      };
      moviesApi.genres.mockReturnValue(of(errorResponse as any));

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['selectedGenre'].disabled).toBe(true);
    });
  });

  describe('Movies Loading', () => {
    it('should load movies on initialization with page size 1 to get total movie count', () => {
      fixture.detectChanges();

      expect(moviesApi.movies).toHaveBeenCalledWith(undefined, 1, 1);
    });

    it('should load movies for selected genre', (done) => {
      fixture.detectChanges();

      moviesApi.movies.mockClear();
      component['selectedGenre'].setValue('Action');

      setTimeout(() => {
        expect(moviesApi.movies).toHaveBeenCalledWith(
          { genre: 'Action' },
          1,
          9
        );
        done();
      }, 10);
    });

    it('should reset to page 1 when genre changes', (done) => {
      fixture.detectChanges();

      component['pageSettings'].set({ page: 3, perPage: 9 });
      component['selectedGenre'].setValue('Comedy');

      setTimeout(() => {
        expect(component['pageSettings']()).toEqual({ page: 1, perPage: 9 });
        done();
      }, 10);
    });

    it('should handle movie loading errors gracefully', (done) => {
      const errorResponse = {
        data: undefined,
        loading: false,
        error: new Error('Failed to load movies'),
      };
      moviesApi.movies.mockReturnValue(of(errorResponse));

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      setTimeout(() => {
        expect(component['movies']()).toEqual([]);
        done();
      }, 10);
    });
  });

  describe('Total Movies Count', () => {
    it('should fetch total movies count on initialization', (done) => {
      moviesApi.movies.mockReturnValue(of(mockTotalMoviesResponse as any));
      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      setTimeout(() => {
        expect(component['totalMovies']()).toBe(90);
        done();
      }, 10);
    });

    it('should update total movies count when genre changes', (done) => {
      moviesApi.movies.mockReturnValue(of(mockTotalMoviesResponse as any));
      fixture.detectChanges();

      moviesApi.movies.mockClear();
      const genreMoviesResponse = {
        data: {
          movies: {
            pagination: {
              totalPages: 45,
            },
          },
        },
      };
      moviesApi.movies.mockReturnValue(of(genreMoviesResponse as any));

      component['selectedGenre'].setValue('Action');

      setTimeout(() => {
        expect(moviesApi.movies).toHaveBeenCalledWith(
          { genre: 'Action' },
          1,
          1
        );
        expect(component['totalMovies']()).toBe(45);
        done();
      }, 10);
    });

    it('should return 0 total movies on error', (done) => {
      moviesApi.movies.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      setTimeout(() => {
        expect(component['totalMovies']()).toBe(0);
        done();
      }, 10);
    });
  });

  describe('Pagination', () => {
    it('should update page settings when page changes', () => {
      fixture.detectChanges();

      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 18,
        length: 90,
      };

      component['onPageChange'](pageEvent);

      expect(component['pageSettings']()).toEqual({ page: 3, perPage: 18 });
    });

    it('should load movies with new page settings', (done) => {
      fixture.detectChanges();
      moviesApi.movies.mockClear();

      component['pageSettings'].set({ page: 2, perPage: 18 });

      setTimeout(() => {
        expect(moviesApi.movies).toHaveBeenCalledWith(undefined, 2, 18);
        done();
      }, 10);
    });
  });

  describe('View Type', () => {
    it('should default to table view', () => {
      expect(component['viewType']).toBe('table');
    });

    it('should allow switching view type', () => {
      component['viewType'] = 'card';
      expect(component['viewType']).toBe('card');

      component['viewType'] = 'table';
      expect(component['viewType']).toBe('table');
    });
  });

  describe('Genre Selection', () => {
    it('should handle empty genre selection', (done) => {
      fixture.detectChanges();
      moviesApi.movies.mockClear();

      component['selectedGenre'].setValue('');

      setTimeout(() => {
        expect(moviesApi.movies).toHaveBeenCalledWith(undefined, 1, 9);
        done();
      }, 10);
    });
  });

  describe('Loading States', () => {
    it('should reflect genre loading state', () => {
      const loadingResponse = { ...mockGenresResponse, loading: true };
      moviesApi.genres.mockReturnValue(of(loadingResponse as any));

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['isLoadingGenres']()).toBe(true);
    });

    it('should reflect movie loading state', (done) => {
      const loadingResponse = { ...mockMoviesResponse, loading: true };
      moviesApi.movies.mockReturnValue(of(loadingResponse as any));

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      setTimeout(() => {
        expect(component['isLoadingMovies']()).toBe(true);
        done();
      }, 1);
    });
  });

  describe('Error States', () => {
    it('should capture genres loading error', () => {
      const error = new Error('Genre load failed');
      const errorResponse = { ...mockGenresResponse, error };
      moviesApi.genres.mockReturnValue(of(errorResponse as any));

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['genresLoadingError']()).toBe(error);
    });

    it('should capture movies loading error', (done) => {
      const error = new Error('Movies load failed');
      const errorResponse = { loading: false, error };
      moviesApi.movies.mockReturnValue(of(errorResponse as any));

      fixture = TestBed.createComponent(MovieSearch);
      component = fixture.componentInstance;
      fixture.detectChanges();
      setTimeout(() => {
        expect(component['moviesLoadingError']()).toBe(error);
        done();
      }, 1);
    });
  });
});
