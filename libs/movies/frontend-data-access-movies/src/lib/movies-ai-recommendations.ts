import { Injectable } from '@angular/core';

import { initializeApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

@Injectable({
  providedIn: 'root',
})
export class MoviesAiRecommendations {
  // TODO move this to environment variables
  firebaseConfig = {
    apiKey: 'AIzaSyCticL2mi8BbF8aCpFOUuBqp6oAqkiDW5I',
    authDomain: 'acme-movies-fb.firebaseapp.com',
    projectId: 'acme-movies-fb',
    storageBucket: 'acme-movies-fb.firebasestorage.app',
    messagingSenderId: '1007263732812',
    appId: '1:1007263732812:web:9fe238969098c59a0f50e9',
    measurementId: 'G-CR1NEKS4WS',
  };

  firebaseApp = initializeApp(this.firebaseConfig);

  // Create a ReCaptchaEnterpriseProvider instance using your reCAPTCHA Enterprise
  // site key and pass it to initializeAppCheck().
  appCheck = initializeAppCheck(this.firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(
      '6LcS7yosAAAAABaSTq5cA6kz4JE8YA753Lftf7wB'
    ),
    isTokenAutoRefreshEnabled: true, // Set to true to allow auto-refresh.
  });

  ai = getAI(this.firebaseApp, { backend: new GoogleAIBackend() });
  model = getGenerativeModel(this.ai, { model: 'gemini-2.5-flash' });

  async getRecommendations(genre: string, selectedMovie: string) {
    const prompt = `Recommend the top 100 movies for ${genre} genre that are similar to ${selectedMovie}.
    Please format the output as a pipe-delimited list of titles.`;

    const result = await this.model.generateContent(prompt);
    return (
      result.response
        .text()
        .split('|')
        .map((title) => title.trim()) ?? []
    );
  }
}
