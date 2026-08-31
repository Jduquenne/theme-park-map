import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { switchMap } from 'rxjs';
import { ParkSummary } from '../../core/models';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { Skeleton } from '../../shared/components/skeleton';
import { ParkGroup, groupByCountry } from './group-by-location';

@Component({
  selector: 'app-park-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex min-h-0 flex-col overflow-hidden bg-parchment xl:rounded-xl xl:border xl:border-line',
  },
  imports: [RouterLink, RouterLinkActive, Skeleton],
  templateUrl: './park-index.html',
})
export class ParkIndex {
  private readonly repository = inject(ParkRepository);
  private readonly reload = signal(0);

  private readonly request = toSignal(
    toObservable(this.reload).pipe(switchMap(() => toRequestState(this.repository.loadCatalog()))),
    { initialValue: { status: 'loading' } as RequestState<ParkSummary[]> },
  );

  readonly query = signal('');

  readonly status = computed(() => this.request().status);

  private readonly groups = computed<ParkGroup[]>(() => {
    const state = this.request();
    return state.status === 'loaded' ? groupByCountry(state.value) : [];
  });

  readonly parkCount = computed(() =>
    this.groups().reduce((total, group) => total + group.parks.length, 0),
  );

  readonly countryCount = computed(() => this.groups().length);

  readonly filteredGroups = computed<ParkGroup[]>(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) {
      return this.groups();
    }
    return this.groups()
      .map((group) => ({
        country: group.country,
        parks: group.parks.filter((park) => this.matches(park, term)),
      }))
      .filter((group) => group.parks.length > 0);
  });

  monogram(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  retry(): void {
    this.reload.update((n) => n + 1);
  }

  private matches(park: ParkSummary, term: string): boolean {
    return (
      park.name.toLowerCase().includes(term) ||
      park.location.city.toLowerCase().includes(term) ||
      (park.resort?.toLowerCase().includes(term) ?? false)
    );
  }
}
