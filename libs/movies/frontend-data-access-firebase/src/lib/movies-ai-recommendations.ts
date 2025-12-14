import { inject, Injectable } from '@angular/core';

import { FirebaseAppServices } from './firebase-app-services';

@Injectable({
  providedIn: 'root',
})
export class MoviesAiRecommendations {
  private readonly firebaseAppServices = inject(FirebaseAppServices);

  async getRecommendations(genre: string, selectedMovie: string) {
    const prompt = `Recommend the top 100 movies for ${genre} genre that are similar to ${selectedMovie}.
    Format the output as a pipe-delimited list of titles. Do not include any extra information with the title, just the official title. Example output: "The Matrix|The Matrix Reloaded|Inception".`;

    const result = await this.firebaseAppServices
      .getGeminiModel()
      .generateContent(prompt);
    return (
      result.response
        .text()
        .split('|')
        .map((title) => title.trim()) ?? []
    );
  }
}
