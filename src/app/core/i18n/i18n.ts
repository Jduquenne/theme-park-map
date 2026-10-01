import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { LocalizedText } from '../models';
import { DEFAULT_LOCALE, LOCALES, Locale, isLocale } from './locale';
import { Translations, en } from './translations/en';
import { fr } from './translations/fr';

const STORAGE_KEY = 'locale';

const DICTIONARIES: Record<Locale, Translations> = { en, fr };

function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

function detectBrowserLocale(): Locale {
  for (const language of navigator.languages ?? [navigator.language]) {
    const match = LOCALES.find((locale) => language.toLowerCase().startsWith(locale));
    if (match) {
      return match;
    }
  }
  return DEFAULT_LOCALE;
}

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);

  readonly locale = signal<Locale>(readStoredLocale() ?? detectBrowserLocale());
  readonly t = computed(() => DICTIONARIES[this.locale()]);

  private readonly compactNumber = computed(
    () => new Intl.NumberFormat(this.locale(), { notation: 'compact', maximumFractionDigits: 1 }),
  );
  private readonly regionNames = computed(
    () => new Intl.DisplayNames([this.locale()], { type: 'region' }),
  );

  constructor() {
    effect(() => {
      const { meta } = this.t();
      this.document.documentElement.lang = this.locale();
      this.document.title = meta.title;
      this.meta.updateTag({ name: 'description', content: meta.description });
    });
  }

  use(locale: Locale): void {
    this.locale.set(locale);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Storage blocked (private mode, site data disabled): the choice just isn't remembered.
    }
  }

  localize(text: LocalizedText): string;
  localize(text: LocalizedText | null): string | null;
  localize(text: LocalizedText | null): string | null {
    if (text === null) {
      return null;
    }
    return text[this.locale()] ?? text[DEFAULT_LOCALE] ?? Object.values(text)[0] ?? '';
  }

  formatCount(value: number): string {
    return this.compactNumber().format(value);
  }

  countryName(countryCode: string): string {
    return this.regionNames().of(countryCode) ?? countryCode;
  }
}
