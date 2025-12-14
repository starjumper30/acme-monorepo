import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { MoviesAiRecommendations } from '@acme/movies/frontend-data-access-firebase';
import { MoviesApi } from '@acme/movies/frontend-data-access-movies';
import { EnrichedMovie } from '@acme/movies/util-movies';

import { MovieRecommendations } from './movie-recommendations';

describe('MovieRecommendations', () => {
  let component: MovieRecommendations;
  let fixture: ComponentFixture<MovieRecommendations>;
  let moviesApiMock: jest.Mocked<MoviesApi>;
  let aiServiceMock: jest.Mocked<MoviesAiRecommendations>;

  const mockMovie: EnrichedMovie = {
    id: 'm1',
    title: 'The Matrix',
    datePublished: '1999-03-31',
    duration: 'PT2H16M',
    releaseYear: '1999',
    runningTime: '2h 16m',
  } as EnrichedMovie;

  const mockMoviesApiResponse = {
    loading: false,
    data: {
      movies: {
        nodes: [mockMovie],
      },
    },
  };

  beforeEach(async () => {
    moviesApiMock = {
      moviesByTitlesSearch: jest.fn(),
    } as any;

    aiServiceMock = {
      getRecommendations: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [MovieRecommendations],
      providers: [
        { provide: MoviesApi, useValue: moviesApiMock },
        { provide: MoviesAiRecommendations, useValue: aiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieRecommendations);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not load recommendations when active is false', (done) => {
    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).not.toHaveBeenCalled();
      expect(moviesApiMock.moviesByTitlesSearch).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should not load recommendations when title is empty', (done) => {
    fixture.componentRef.setInput('selectedMovie', '');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).not.toHaveBeenCalled();
      expect(moviesApiMock.moviesByTitlesSearch).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should not load recommendations when genre is empty', (done) => {
    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', '');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).not.toHaveBeenCalled();
      expect(moviesApiMock.moviesByTitlesSearch).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should load recommendations successfully when all inputs are valid', (done) => {
    const mockTitles = ['Blade Runner', 'Ghost in the Shell'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of(mockMoviesApiResponse as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).toHaveBeenCalledWith(
        'Sci-Fi',
        'The Matrix'
      );
      expect(moviesApiMock.moviesByTitlesSearch).toHaveBeenCalledWith(
        mockTitles
      );

      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.loading).toBe(false);
      expect(recommendations.results).toEqual([mockMovie]);
      expect(recommendations.title).toBe('The Matrix');
      expect(recommendations.genre).toBe('Sci-Fi');
      done();
    }, 100);
  });

  it('should show loading state initially', (done) => {
    const mockTitles = ['Blade Runner'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of({ ...mockMoviesApiResponse, loading: true } as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.message).toContain('Loading recommendations');
      done();
    }, 50);
  });

  it('should handle AI service error gracefully', (done) => {
    aiServiceMock.getRecommendations.mockRejectedValue(
      new Error('AI service failed')
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).toHaveBeenCalled();

      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.loading).toBe(false);
      expect(recommendations.message).toBe(
        'Failed to get recommendations from AI'
      );
      done();
    }, 100);
  });

  it('should handle movies API error gracefully', (done) => {
    const mockTitles = ['Blade Runner'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      throwError(() => new Error('API failed'))
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.loading).toBe(false);
      expect(recommendations.message).toBe(
        'Failed to load recommendations from movies API.'
      );
      done();
    }, 100);
  });

  it('should handle API response error', (done) => {
    const mockTitles = ['Blade Runner'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of({
        loading: false,
        error: { message: 'GraphQL error' },
      } as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.loading).toBe(false);
      expect(recommendations.message).toBe(
        'Failed to load recommendations from movies API.'
      );
      done();
    }, 100);
  });

  it('should handle empty titles from AI service', (done) => {
    aiServiceMock.getRecommendations.mockResolvedValue([]);

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).toHaveBeenCalled();
      expect(moviesApiMock.moviesByTitlesSearch).not.toHaveBeenCalled();

      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.titles).toEqual([]);
      done();
    }, 100);
  });

  it('should not reload recommendations if inputs have not changed', (done) => {
    const mockTitles = ['Blade Runner'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of(mockMoviesApiResponse as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).toHaveBeenCalledTimes(1);

      // Set the same values again
      fixture.componentRef.setInput('selectedMovie', 'The Matrix');
      fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
      fixture.detectChanges();

      setTimeout(() => {
        // Should still be called only once due to caching logic
        expect(aiServiceMock.getRecommendations).toHaveBeenCalledTimes(1);
        done();
      }, 100);
    }, 100);
  });

  it('should reload recommendations when movie changes', (done) => {
    const mockTitles = ['Blade Runner'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of(mockMoviesApiResponse as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).toHaveBeenCalledTimes(1);

      // Change the movie
      fixture.componentRef.setInput('selectedMovie', 'Inception');
      fixture.detectChanges();

      setTimeout(() => {
        expect(aiServiceMock.getRecommendations).toHaveBeenCalledTimes(2);
        expect(aiServiceMock.getRecommendations).toHaveBeenCalledWith(
          'Sci-Fi',
          'Inception'
        );
        done();
      }, 100);
    }, 100);
  });

  it('should reload recommendations when genre changes', (done) => {
    const mockTitles = ['Blade Runner'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of(mockMoviesApiResponse as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      expect(aiServiceMock.getRecommendations).toHaveBeenCalledTimes(1);

      // Change the genre
      fixture.componentRef.setInput('selectedGenre', 'Action');
      fixture.detectChanges();

      setTimeout(() => {
        expect(aiServiceMock.getRecommendations).toHaveBeenCalledTimes(2);
        expect(aiServiceMock.getRecommendations).toHaveBeenCalledWith(
          'Action',
          'The Matrix'
        );
        done();
      }, 100);
    }, 100);
  });

  it('should enrich movies from API response', (done) => {
    const mockTitles = ['Test Movie'];
    const mockApiMovie = {
      id: 'm2',
      title: 'Test Movie',
      datePublished: '2020-01-01',
      duration: 'PT1H30M',
    };

    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of({
        loading: false,
        data: {
          movies: {
            nodes: [mockApiMovie],
          },
        },
      } as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.results).toHaveLength(1);
      expect(recommendations.results[0].releaseYear).toBe('2020');
      expect(recommendations.results[0].runningTime).toBe('1h 30m');
      done();
    }, 100);
  });

  it('should handle null or undefined nodes in API response', (done) => {
    const mockTitles = ['Test Movie'];
    aiServiceMock.getRecommendations.mockResolvedValue(mockTitles);
    moviesApiMock.moviesByTitlesSearch.mockReturnValue(
      of({
        loading: false,
        data: {
          movies: {
            nodes: null,
          },
        },
      } as any)
    );

    fixture.componentRef.setInput('selectedMovie', 'The Matrix');
    fixture.componentRef.setInput('selectedGenre', 'Sci-Fi');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();

    setTimeout(() => {
      const recommendations = (component as any).recommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.results).toEqual([]);
      done();
    }, 100);
  });
});
