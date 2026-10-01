import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n/i18n';
import { Locale } from '../../core/i18n/locale';

interface LocaleOption {
  locale: Locale;
  code: string;
  nativeName: string;
}

const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { locale: 'en', code: 'EN', nativeName: 'English' },
  { locale: 'fr', code: 'FR', nativeName: 'Français' },
];

@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      role="group"
      [attr.aria-label]="i18n.t().language.label"
      class="flex gap-0.5 rounded-lg border border-line bg-card p-0.5"
    >
      @for (option of options; track option.locale) {
        <button
          type="button"
          (click)="i18n.use(option.locale)"
          [attr.aria-pressed]="option.locale === i18n.locale()"
          [attr.aria-label]="option.nativeName"
          [attr.title]="option.nativeName"
          [attr.lang]="option.locale"
          class="rounded-md px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide transition-colors"
          [class]="
            option.locale === i18n.locale()
              ? 'bg-denim text-card'
              : 'text-ink-soft hover:bg-parchment hover:text-ink'
          "
        >
          {{ option.code }}
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcher {
  protected readonly i18n = inject(I18n);
  protected readonly options = LOCALE_OPTIONS;
}
