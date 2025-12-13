import { toEnrichedMovie } from './enriched-movie';
import { Movie } from './movies-schema';

describe('toEnrichedMovie', () => {
  it('should copy all original movie fields', () => {
    const movie: Movie = {
      id: 'm1',
      title: 'Test Movie',
      duration: 'PT1H30M',
      datePublished: '2024-05-10',
    } as any;

    const enriched = toEnrichedMovie(movie);

    expect(enriched.id).toBe(movie.id);
    expect(enriched.title).toBe(movie.title);
    expect(enriched.duration).toBe(movie.duration);
    expect(enriched.datePublished).toBe(movie.datePublished);
  });

  it('should set releaseYear from datePublished (first 4 chars)', () => {
    const movie: Movie = {
      title: 'Test Movie',
      datePublished: '1999-12-31',
    } as any;

    const enriched = toEnrichedMovie(movie);

    expect(enriched.releaseYear).toBe('1999');
  });

  it('should set releaseYear to undefined when datePublished is missing', () => {
    const movie: Movie = {
      title: 'No Date',
    } as any;

    const enriched = toEnrichedMovie(movie);

    expect(enriched.releaseYear).toBeUndefined();
  });

  it('should parse runningTime from ISO-8601 duration PT#H#M', () => {
    const movie: Movie = {
      title: 'Runtime Movie',
      duration: 'PT2H5M',
    } as any;

    const enriched = toEnrichedMovie(movie);

    expect(enriched.runningTime).toBe('2h 5m');
  });

  it('should parse runningTime even when hours/minutes are zero', () => {
    const movie: Movie = {
      title: 'Zero Runtime Movie',
      duration: 'PT0H0M',
    } as any;

    const enriched = toEnrichedMovie(movie);

    expect(enriched.runningTime).toBe('0h 0m');
  });

  it('should return empty runningTime when duration is missing', () => {
    const movie: Movie = {
      title: 'No Duration Movie',
    } as any;

    const enriched = toEnrichedMovie(movie);

    expect(enriched.runningTime).toBe('');
  });

  it('should return empty runningTime when duration format does not match expected pattern', () => {
    const movie: Movie = {
      title: 'Weird Duration Movie',
      duration: '90 minutes',
    } as any;

    const enriched = toEnrichedMovie(movie);

    expect(enriched.runningTime).toBe('');
  });

  it('should not mutate the input object', () => {
    const movie: Movie = {
      title: 'Immutable Movie',
      duration: 'PT1H1M',
      datePublished: '2001-01-01',
    } as any;

    const original = { ...movie };

    toEnrichedMovie(movie);

    expect(movie).toEqual(original);
  });
});
