import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { MoviesApi } from './movies-api';

describe('App', () => {
  let moviesApiMock: jest.Mocked<MoviesApi>;

  beforeEach(async () => {
    moviesApiMock = {
      moviesByGenre: jest.fn(),
    } as any;
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MoviesApi, useValue: moviesApiMock },
      ],
    }).compileComponents();
  });

  it('should render Movies:', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Movies:');
  });
});
