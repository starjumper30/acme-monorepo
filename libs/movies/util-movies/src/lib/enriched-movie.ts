import { Movie } from './movies-schema';

export interface EnrichedMovie extends Movie {
  runtime?: string;
  releaseYear?: string;
}

const runtimeRegex = /^PT(?<hours>\d+)H(?<minutes>\d+)M$/;
function parseRuntime(movie: Movie) {
  const match = movie.duration?.match(runtimeRegex);
  return match?.groups?.['hours']
    ? `${match.groups['hours'] ?? '0'}h ${match.groups['minutes'] ?? '0'}m`
    : '';
}

export function toEnrichedMovie(movie: Movie): EnrichedMovie {
  return {
    ...movie,
    releaseYear: movie.datePublished?.slice(0, 4),
    runtime: parseRuntime(movie),
  };
}
