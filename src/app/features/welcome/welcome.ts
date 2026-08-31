import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { ParkSummary } from '../../core/models';
import { ParkIndex } from '../park-index/park-index';

@Component({
  selector: 'app-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col xl:items-center xl:justify-center xl:p-8' },
  imports: [ParkIndex],
  template: `
    <app-park-index class="min-h-0 flex-1 xl:hidden" />

    <div class="hidden max-w-md text-center xl:block">
      <h1 class="font-display text-3xl font-semibold uppercase tracking-[0.14em] text-ink">
        The park map archive
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-ink-soft">
        Browse historical theme-park plans across the decades. Pick a park from the index on the
        left to open its maps, points of interest and timeline.
      </p>
      @if (stats(); as stats) {
        <p
          class="mt-6 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft"
        >
          {{ stats.parks }} parks · {{ stats.countries }} countries
        </p>
      }
    </div>
  `,
})
export class Welcome {
  private readonly repository = inject(ParkRepository);

  private readonly request = toSignal(toRequestState(this.repository.loadCatalog()), {
    initialValue: { status: 'loading' } as RequestState<ParkSummary[]>,
  });

  protected readonly stats = computed(() => {
    const state = this.request();
    if (state.status !== 'loaded') {
      return null;
    }
    const countries = new Set(state.value.map((park) => park.location.country));
    return { parks: state.value.length, countries: countries.size };
  });
}
