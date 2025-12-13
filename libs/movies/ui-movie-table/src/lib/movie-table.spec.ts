import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieTable } from './movie-table';

describe('MovieTable', () => {
  let fixture: ComponentFixture<MovieTable>;
  let component: MovieTable;
  let componentRef: ComponentRef<MovieTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieTable],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieTable);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw error if no movies input is provided', () => {
    expect(() => fixture.detectChanges()).toThrow(
      'NG0950: Input is required but no value is available yet. Find more at https://v20.angular.dev/errors/NG0950'
    );
  });

  it('should display multiple movies', () => {
    const movies = [
      { id: 1, title: 'Harry Potter', ratingValue: 8 },
      { id: 2, title: 'Lord of the Rings', ratingValue: 9 },
      { id: 3, title: 'Star Wars', ratingValue: 7.5 },
    ];
    componentRef.setInput('movies', movies);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Harry Potter');
    expect(compiled.textContent).toContain('Lord of the Rings');
    expect(compiled.textContent).toContain('Star Wars');
  });

  it('should handle empty movies array', () => {
    componentRef.setInput('movies', []);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });

  it('should display movie ratings', () => {
    componentRef.setInput('movies', [
      { id: 1, title: 'Test Movie', ratingValue: 8.5 },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8.5');
  });

  it('should handle movies with zero rating', () => {
    componentRef.setInput('movies', [
      { id: 1, title: 'Unrated Movie', ratingValue: 0 },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('0');
  });

  it('should handle movies with no rating', () => {
    componentRef.setInput('movies', [{ id: 1, title: 'Unrated Movie' }]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Unrated Movie');
  });

  it('should update when movies input changes', () => {
    const initialMovies = [{ id: 1, title: 'Initial Movie', ratingValue: 7 }];
    componentRef.setInput('movies', initialMovies);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Initial Movie');

    const updatedMovies = [{ id: 2, title: 'Updated Movie', ratingValue: 9 }];
    componentRef.setInput('movies', updatedMovies);
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Updated Movie');
    expect(compiled.textContent).not.toContain('Initial Movie');
  });

  it('should handle movies with special characters in title', () => {
    componentRef.setInput('movies', [
      { id: 1, title: 'Movie: The "Special" Edition!', ratingValue: 8 },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Movie: The "Special" Edition!');
  });

  it('should handle movies with very long titles', () => {
    const longTitle = 'A'.repeat(200);
    componentRef.setInput('movies', [
      { id: 1, title: longTitle, ratingValue: 7 },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement).toBeTruthy();
  });

  // TODO test handling of array fields
  // TODO test handling of selected genre
});
