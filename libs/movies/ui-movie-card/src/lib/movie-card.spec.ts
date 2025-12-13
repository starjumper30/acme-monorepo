import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EnrichedMovie } from '@acme/movies/util-movies';

import { MovieCard } from './movie-card';

describe('MovieCard', () => {
  let component: MovieCard;
  let fixture: ComponentFixture<MovieCard>;
  let compiled: DebugElement;

  const mockMovie: EnrichedMovie = {
    id: '1',
    title: 'The Matrix',
    ratingValue: 8.7,
    genres: [{ title: 'Action' }, { title: 'Sci-Fi' }],
    runningTime: '1H 36M',
    releaseYear: '1999',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCard);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw error if no movie input is provided', () => {
    expect(() => fixture.detectChanges()).toThrow(
      'NG0950: Input is required but no value is available yet. Find more at https://v20.angular.dev/errors/NG0950'
    );
  });

  describe('Component Inputs', () => {
    it('should accept movie input', () => {
      fixture.componentRef.setInput('movie', mockMovie);
      fixture.detectChanges();

      expect(component.movie()).toEqual(mockMovie);
    });

    it('should accept selectedGenre input', () => {
      fixture.componentRef.setInput('movie', mockMovie);
      fixture.componentRef.setInput('selectedGenre', 'Action');
      fixture.detectChanges();

      expect(component.selectedGenre()).toBe('Action');
    });

    it('should default selectedGenre to empty string', () => {
      fixture.componentRef.setInput('movie', mockMovie);
      fixture.detectChanges();

      expect(component.selectedGenre()).toBe('');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('movie', mockMovie);
      fixture.detectChanges();
    });

    it('should render movie title', () => {
      const titleElement = compiled.query(By.css('mat-card-title'));
      expect(titleElement).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle movie with minimal data', () => {
      const minimalMovie: EnrichedMovie = {
        id: '2',
        title: 'Minimal Movie',
        ratingValue: 5.0,
        genres: [],
      };

      fixture.componentRef.setInput('movie', minimalMovie);
      fixture.detectChanges();

      expect(component.movie()).toEqual(minimalMovie);
    });

    it('should handle movie with optional fields', () => {
      const movieWithOptionals: EnrichedMovie = {
        id: '3',
        title: 'Complete Movie',
        ratingValue: 9.0,
        genres: [{ title: 'Drama' }, { title: 'Thriller' }],
        runningTime: '1H 20M',
        releaseYear: '2020',
      };

      fixture.componentRef.setInput('movie', movieWithOptionals);
      fixture.detectChanges();

      expect(component.movie().runningTime).toBe('1H 20M');
      expect(component.movie().releaseYear).toBe('2020');
    });
  });

  describe('Material Components', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('movie', mockMovie);
      fixture.detectChanges();
    });

    it('should include MatCard component', () => {
      const matCard = compiled.query(By.css('mat-card'));
      expect(matCard).toBeTruthy();
    });
  });

  describe('Rating Component Integration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('movie', mockMovie);
      fixture.detectChanges();
    });

    it('should render Rating component', () => {
      const ratingComponent = compiled.query(By.css('acme-rating'));
      expect(ratingComponent).toBeTruthy();
    });
  });
});
