import { Injectable } from '@angular/core';

import { initializeApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import {
  AI,
  GenerativeModel,
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
} from 'firebase/ai';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAppServices {
  // TODO move this to environment variables
  private readonly firebaseConfig = {
    apiKey: 'AIzaSyCticL2mi8BbF8aCpFOUuBqp6oAqkiDW5I',
    authDomain: 'acme-movies-fb.firebaseapp.com',
    projectId: 'acme-movies-fb',
    storageBucket: 'acme-movies-fb.firebasestorage.app',
    messagingSenderId: '1007263732812',
    appId: '1:1007263732812:web:9fe238969098c59a0f50e9',
    measurementId: 'G-CR1NEKS4WS',
  };

  private readonly firebaseApp = initializeApp(this.firebaseConfig);

  // Create a ReCaptchaEnterpriseProvider instance using your reCAPTCHA Enterprise
  // site key and pass it to initializeAppCheck().
  private readonly appCheck = initializeAppCheck(this.firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(
      '6LcS7yosAAAAABaSTq5cA6kz4JE8YA753Lftf7wB' // TODO env variable
    ),
    isTokenAutoRefreshEnabled: true, // Set to true to allow auto-refresh.
  });

  private ai: AI | undefined;
  private model: GenerativeModel | undefined;

  private initGeminiModel() {
    this.ai = getAI(this.firebaseApp, {
      backend: new GoogleAIBackend(),
    });

    this.model = getGenerativeModel(this.ai, {
      model: 'gemini-2.5-flash',
    });
    return this.model;
  }

  getGeminiModel() {
    if (!this.model) {
      return this.initGeminiModel();
    }
    return this.model;
  }
}
