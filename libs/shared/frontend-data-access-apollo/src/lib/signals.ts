import { Observable } from 'rxjs';
import { ObservableQuery } from '@apollo/client';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';

export function apolloResultToSignals<T>(
  valueChanges: Observable<
    | ObservableQuery.Result<T, 'complete' | 'empty' | 'streaming' | 'partial'>
    | {
        loading?: boolean;
        data?: T;
        error?: { message?: string };
      }
  >
) {
  const result = toSignal(valueChanges);
  const isLoading = computed(() => result()?.loading ?? true);
  const data = computed(() => result()?.data as T | undefined);
  const error = computed(() => result()?.error);

  return {
    result,
    isLoading,
    data,
    error,
  };
}
