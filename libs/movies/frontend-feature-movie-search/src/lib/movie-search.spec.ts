import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviesApi } from '@acme/shared/frontend-data-access-movies';

import { MovieSearch } from './movie-search';
import { of } from 'rxjs';

describe('MovieSearch', () => {
  let component: MovieSearch;
  let fixture: ComponentFixture<MovieSearch>;
  let moviesApiMock: jest.Mocked<MoviesApi>;

  beforeEach(async () => {
    moviesApiMock = {
      movies: jest
        .fn()
        .mockReturnValue(
          of({ data: { movies: { nodes: [] }, loading: false } })
        ),
      genres: jest
        .fn()
        .mockReturnValue(
          of({ data: { genres: { nodes: [] }, loading: false } })
        ),
    } as any;

    await TestBed.configureTestingModule({
      imports: [MovieSearch],
      providers: [{ provide: MoviesApi, useValue: moviesApiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO more tests
});
