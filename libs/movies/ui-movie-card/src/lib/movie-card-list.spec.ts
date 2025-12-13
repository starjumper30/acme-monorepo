import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { EnrichedMovie } from '@acme/movies/util-movies';

import { MovieCardList } from './movie-card-list';
import { MovieCard } from './movie-card';

describe('MovieCardList', () => {
  let component: MovieCardList;
  let fixture: ComponentFixture<MovieCardList>;
  let compiled: DebugElement;

  const mockMovies: EnrichedMovie[] = [
    {
      id: '1',
      title: 'The Shawshank Redemption',
      genres: [
        { title: 'Drama', id: 18 },
        { title: 'Thriller', id: 53 },
      ],
      ratingValue: 8.7,
      datePublished: '1994-09-23',
      posterUrl: '/poster1.jpg',
      summary: 'Two imprisoned men bond over a number of years',
    },
    {
      id: '2',
      title: 'The Godfather',
      genres: [{ title: 'Crime', id: 80 }],
      ratingValue: 9.2,
      datePublished: '1972-03-24',
      posterUrl: '/poster2.jpg',
      summary: 'The aging patriarch of an organized crime dynasty',
    },
    {
      id: '3',
      title: 'The Dark Knight',
      genres: [{ title: 'Action', id: 28 }],
      ratingValue: 9.0,
      datePublished: '2008-07-18',
      posterUrl: '/poster3.jpg',
      summary: 'When the menace known as the Joker wreaks havoc',
    },
  ] as unknown[] as EnrichedMovie[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardList, MovieCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardList);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty selectedGenre input', () => {
    fixture.detectChanges();
    expect(component.selectedGenre()).toBe('');
  });

  it('should have default empty movies array input', () => {
    fixture.detectChanges();
    expect(component.movies()).toEqual([]);
  });

  it('should accept and store selectedGenre input value', () => {
    fixture.componentRef.setInput('selectedGenre', 'Action');
    fixture.detectChanges();

    expect(component.selectedGenre()).toBe('Action');
  });

  it('should accept and store movies input value', () => {
    fixture.componentRef.setInput('movies', mockMovies);
    fixture.detectChanges();

    expect(component.movies()).toEqual(mockMovies);
    expect(component.movies().length).toBe(3);
  });

  it('should render movie cards for each movie in the list', () => {
    fixture.componentRef.setInput('movies', mockMovies);
    fixture.detectChanges();

    const movieCardElements = compiled.queryAll(By.directive(MovieCard));
    expect(movieCardElements.length).toBe(3);
  });

  it('should not render any movie cards when movies array is empty', () => {
    fixture.componentRef.setInput('movies', []);
    fixture.detectChanges();

    const movieCardElements = compiled.queryAll(By.directive(MovieCard));
    expect(movieCardElements.length).toBe(0);
  });

  it('should pass correct movie data to each MovieCard component', () => {
    fixture.componentRef.setInput('movies', mockMovies);
    fixture.detectChanges();

    const movieCardElements = compiled.queryAll(By.directive(MovieCard));
    const firstMovieCard = movieCardElements[0].componentInstance;

    expect(firstMovieCard.movie()).toEqual(mockMovies[0]);
  });

  it('should update rendered movie cards when movies input changes', () => {
    fixture.componentRef.setInput('movies', mockMovies);
    fixture.detectChanges();

    let movieCardElements = compiled.queryAll(By.directive(MovieCard));
    expect(movieCardElements.length).toBe(3);

    const newMovies = [mockMovies[0]];
    fixture.componentRef.setInput('movies', newMovies);
    fixture.detectChanges();

    movieCardElements = compiled.queryAll(By.directive(MovieCard));
    expect(movieCardElements.length).toBe(1);
  });

  describe('integration with MovieCard', () => {
    it('should render all movie cards with correct data', () => {
      fixture.componentRef.setInput('movies', mockMovies);
      fixture.detectChanges();

      const movieCardElements = compiled.queryAll(By.directive(MovieCard));

      movieCardElements.forEach((cardElement, index) => {
        const cardInstance = cardElement.componentInstance;
        expect(cardInstance.movie()).toEqual(mockMovies[index]);
      });
    });
  });

  describe('selectedGenre input behavior', () => {
    it('should update when selectedGenre changes', () => {
      fixture.componentRef.setInput('selectedGenre', 'Drama');
      fixture.detectChanges();
      expect(component.selectedGenre()).toBe('Drama');

      fixture.componentRef.setInput('selectedGenre', 'Comedy');
      fixture.detectChanges();
      expect(component.selectedGenre()).toBe('Comedy');
    });

    it('should handle empty string for selectedGenre', () => {
      fixture.componentRef.setInput('selectedGenre', '');
      fixture.detectChanges();
      expect(component.selectedGenre()).toBe('');
    });
  });
});
