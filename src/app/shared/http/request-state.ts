import { Observable, catchError, map, of, startWith } from 'rxjs';

export type RequestState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: unknown }
  | { readonly status: 'loaded'; readonly value: T };

export function toRequestState<T>(source: Observable<T>): Observable<RequestState<T>> {
  return source.pipe(
    map((value): RequestState<T> => ({ status: 'loaded', value })),
    startWith<RequestState<T>>({ status: 'loading' }),
    catchError((error: unknown): Observable<RequestState<T>> => of({ status: 'error', error })),
  );
}
