import { WritableSignal, computed, inject, linkedSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { debounceTime } from 'rxjs';

export interface QueryParamCodec<T> {
  parse(raw: string | null): T;
  serialize(value: T): string | null;
}

export const stringParam: QueryParamCodec<string | null> = {
  parse: (raw) => raw,
  serialize: (value) => value,
};

export const numberParam: QueryParamCodec<number | null> = {
  parse: (raw) => (raw === null ? null : Number(raw)),
  serialize: (value) => (value === null ? null : String(value)),
};

type AnyCodec = { parse(raw: string | null): unknown; serialize(value: never): string | null };
type CodecMap = Record<string, AnyCodec>;
type ParamSignals<T extends CodecMap> = {
  [K in keyof T]: WritableSignal<ReturnType<T[K]['parse']>>;
};

const WRITE_DEBOUNCE_MS = 150;

/**
 * Two-way binds a set of query parameters to writable signals: reads track navigation, writes are
 * merged back into the URL as a single debounced `replaceUrl` navigation.
 */
export function queryParamsState<T extends CodecMap>(codecs: T): ParamSignals<T> {
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const entries = Object.entries(codecs) as [string, QueryParamCodec<unknown>][];

  const paramMap = toSignal(route.queryParamMap, { initialValue: route.snapshot.queryParamMap });

  const signals: Record<string, WritableSignal<unknown>> = Object.fromEntries(
    entries.map(([key, codec]) => [key, linkedSignal(() => codec.parse(paramMap().get(key)))]),
  );

  const queryParams = computed<Params>(() =>
    Object.fromEntries(entries.map(([key, codec]) => [key, codec.serialize(signals[key]())])),
  );

  toObservable(queryParams)
    .pipe(debounceTime(WRITE_DEBOUNCE_MS), takeUntilDestroyed())
    .subscribe((params) =>
      router.navigate([], {
        relativeTo: route,
        queryParams: params,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );

  return signals as unknown as ParamSignals<T>;
}
