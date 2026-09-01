import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { switchMap } from 'rxjs';
import { ParkSummary } from '../../core/models';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { formatCount } from '../../shared/text/format-count';
import { Skeleton } from '../../shared/components/skeleton';
import {
  DEFAULT_DIRECTION,
  ParkSort,
  ParkStatus,
  SortDirection,
  countriesOf,
  filterAndSortParks,
} from './park-filtering';

interface SortOption {
  key: ParkSort;
  ascLabel: string;
  descLabel: string;
}

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
  readonly sort = signal<ParkSort>('name');
  readonly direction = signal<SortDirection>('asc');
  readonly statusFilter = signal<ParkStatus>('all');
  readonly country = signal<string>('all');

  readonly sortOptions: readonly SortOption[] = [
    { key: 'name', ascLabel: 'A–Z', descLabel: 'Z–A' },
    { key: 'visitors', ascLabel: 'Fewest', descLabel: 'Most' },
    { key: 'opened', ascLabel: 'Oldest', descLabel: 'Newest' },
  ];
  readonly statusOptions: readonly ParkStatus[] = ['all', 'open', 'closed'];

  readonly status = computed(() => this.request().status);

  private readonly catalog = computed<ParkSummary[]>(() => {
    const state = this.request();
    return state.status === 'loaded' ? state.value : [];
  });

  readonly parkCount = computed(() => this.catalog().length);
  readonly countries = computed(() => countriesOf(this.catalog()));
  readonly countryCount = computed(() => this.countries().length);

  readonly visibleParks = computed(() =>
    filterAndSortParks(this.catalog(), {
      query: this.query(),
      sort: this.sort(),
      direction: this.direction(),
      status: this.statusFilter(),
      country: this.country(),
    }),
  );

  readonly sortIndex = computed(() => this.sortOptions.findIndex((o) => o.key === this.sort()));
  readonly statusIndex = computed(() => this.statusOptions.indexOf(this.statusFilter()));

  readonly hasActiveFilters = computed(
    () =>
      this.query().trim() !== '' ||
      this.sort() !== 'name' ||
      this.direction() !== 'asc' ||
      this.statusFilter() !== 'all' ||
      this.country() !== 'all',
  );

  protected readonly formatCount = formatCount;

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

  pickSort(key: ParkSort): void {
    if (this.sort() === key) {
      this.direction.update((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sort.set(key);
      this.direction.set(DEFAULT_DIRECTION[key]);
    }
  }

  sortLabel(option: SortOption): string {
    const direction = this.sort() === option.key ? this.direction() : DEFAULT_DIRECTION[option.key];
    return direction === 'asc' ? option.ascLabel : option.descLabel;
  }

  updateCountry(event: Event): void {
    this.country.set((event.target as HTMLSelectElement).value);
  }

  resetFilters(): void {
    this.query.set('');
    this.sort.set('name');
    this.direction.set('asc');
    this.statusFilter.set('all');
    this.country.set('all');
  }

  retry(): void {
    this.reload.update((n) => n + 1);
  }
}
