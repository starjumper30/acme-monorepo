import { TestBed } from '@angular/core/testing';
import { EMPTY, of, Subject } from 'rxjs';
import { apolloResultToSignals } from './signals';

type Data = { id: number; name: string };
describe('apolloResultToSignals', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should convert Apollo result observable to signals', () => {
    TestBed.runInInjectionContext(() => {
      const mockData: Data = { id: 1, name: 'Test' };
      const valueChanges = of({
        loading: false,
        data: mockData,
        error: undefined,
      });

      const signals = apolloResultToSignals<Data>(valueChanges);

      expect(signals.result()).toEqual({
        loading: false,
        data: mockData,
        error: undefined,
      });
      expect(signals.isLoading()).toBe(false);
      expect(signals.data()).toEqual(mockData);
      expect(signals.error()).toBeUndefined();
    });
  });

  it('should handle loading state', () => {
    TestBed.runInInjectionContext(() => {
      const valueChanges = of({
        loading: true,
        data: undefined,
        error: undefined,
      });

      const signals = apolloResultToSignals<Data>(valueChanges);

      expect(signals.isLoading()).toBe(true);
      expect(signals.data()).toBeUndefined();
      expect(signals.error()).toBeUndefined();
    });
  });

  it('should handle error state', () => {
    TestBed.runInInjectionContext(() => {
      const mockError = { message: 'Network error' };
      const valueChanges = of({
        loading: false,
        data: undefined,
        error: mockError,
      });

      const signals = apolloResultToSignals(valueChanges);

      expect(signals.isLoading()).toBe(false);
      expect(signals.data()).toBeUndefined();
      expect(signals.error()).toEqual(mockError);
    });
  });

  it('should default isLoading to true when result is undefined', () => {
    TestBed.runInInjectionContext(() => {
      const signals = apolloResultToSignals(EMPTY);

      // Before any emission, result is undefined
      expect(signals.result()).toBeUndefined();
      expect(signals.isLoading()).toBe(true);
    });
  });

  it('should handle loading state when loading is undefined', () => {
    TestBed.runInInjectionContext(() => {
      const valueChanges = of({
        loading: undefined,
        data: { id: 1 },
        error: undefined,
      });

      const signals = apolloResultToSignals(valueChanges);

      expect(signals.isLoading()).toBe(true);
    });
  });

  it('should update signals reactively when observable emits new values', () => {
    TestBed.runInInjectionContext(() => {
      const subject = new Subject<{
        loading: boolean;
        data: { id: number } | undefined;
        error: { message?: string } | undefined;
      }>();

      const signals = apolloResultToSignals(subject);

      // Initial state
      expect(signals.isLoading()).toBe(true);
      expect(signals.data()).toBeUndefined();

      // First emission
      subject.next({
        loading: true,
        data: undefined,
        error: undefined,
      });

      expect(signals.isLoading()).toBe(true);
      expect(signals.data()).toBeUndefined();

      // Second emission with data
      const mockData = { id: 42 };
      subject.next({
        loading: false,
        data: mockData,
        error: undefined,
      });

      expect(signals.isLoading()).toBe(false);
      expect(signals.data()).toEqual(mockData);
      expect(signals.error()).toBeUndefined();
    });
  });

  it('should handle ObservableQuery.Result with different completeness states', () => {
    TestBed.runInInjectionContext(() => {
      const mockData = { id: 1, name: 'Complete' };
      const valueChanges = of({
        loading: false,
        data: mockData,
        error: undefined,
        // Additional properties that may exist in ObservableQuery.Result
      });

      const signals = apolloResultToSignals(valueChanges);

      expect(signals.data()).toEqual(mockData);
      expect(signals.isLoading()).toBe(false);
    });
  });

  it('should type cast data correctly', () => {
    TestBed.runInInjectionContext(() => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const valueChanges = of({
        loading: false,
        data: mockUser,
        error: undefined,
      });

      const signals = apolloResultToSignals<User>(valueChanges);

      const data = signals.data();
      expect(data).toEqual(mockUser);
      if (data) {
        expect(data.id).toBe(1);
        expect(data.name).toBe('John Doe');
        expect(data.email).toBe('john@example.com');
      }
    });
  });

  it('should handle partial data during streaming', () => {
    TestBed.runInInjectionContext(() => {
      const partialData = { id: 1 };
      const valueChanges = of({
        loading: true,
        data: partialData,
        error: undefined,
      });

      const signals = apolloResultToSignals(valueChanges);

      expect(signals.isLoading()).toBe(true);
      expect(signals.data()).toEqual(partialData);
    });
  });

  it('should return all required signal properties', () => {
    TestBed.runInInjectionContext(() => {
      const valueChanges = of({
        loading: false,
        data: { test: 'data' },
        error: undefined,
      });

      const signals = apolloResultToSignals(valueChanges);

      expect(signals).toHaveProperty('result');
      expect(signals).toHaveProperty('isLoading');
      expect(signals).toHaveProperty('data');
      expect(signals).toHaveProperty('error');
      expect(typeof signals.result).toBe('function');
      expect(typeof signals.isLoading).toBe('function');
      expect(typeof signals.data).toBe('function');
      expect(typeof signals.error).toBe('function');
    });
  });
});
