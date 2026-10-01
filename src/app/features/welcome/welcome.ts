import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ParkRepository } from '../../core/services/park-repository';
import { I18n } from '../../core/i18n/i18n';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { ParkSummary } from '../../core/models';
import { LanguageSwitcher } from '../../shared/components/language-switcher';
import { ParkIndex } from '../park-index/park-index';

@Component({
  selector: 'app-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col xl:items-center xl:justify-center xl:p-8' },
  imports: [ParkIndex, LanguageSwitcher],
  template: `
    <div
      class="flex shrink-0 items-center justify-between border-b border-line px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden"
    >
      <span class="font-display text-base font-semibold uppercase tracking-[0.16em] text-ink">
        Park Map History
      </span>
      <app-language-switcher />
    </div>

    <app-park-index class="min-h-0 flex-1 xl:hidden" />

    <div class="hidden max-w-md text-center xl:block">
      <h1 class="font-display text-3xl font-semibold uppercase tracking-[0.14em] text-ink">
        {{ t().welcome.title }}
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-ink-soft">
        {{ t().welcome.intro }}
      </p>
      @if (summary(); as summary) {
        <p
          class="mt-6 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft"
        >
          {{ summary }}
        </p>
      }
    </div>
  `,
})
export class Welcome {
  private readonly repository = inject(ParkRepository);
  protected readonly t = inject(I18n).t;

  private readonly request = toSignal(toRequestState(this.repository.loadCatalog()), {
    initialValue: { status: 'loading' } as RequestState<ParkSummary[]>,
  });

  protected readonly summary = computed(() => {
    const state = this.request();
    if (state.status !== 'loaded') {
      return null;
    }
    const countryCount = new Set(state.value.map((park) => park.location.countryCode)).size;
    return this.t().welcome.summary(state.value.length, countryCount);
  });
}
