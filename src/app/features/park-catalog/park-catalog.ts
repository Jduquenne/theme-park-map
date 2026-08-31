import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ParkSummary } from '../../core/models';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { Skeleton } from '../../shared/components/skeleton';
import { ParkGroup, groupByCountry } from './group-by-location';

@Component({
  selector: 'app-park-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [RouterLink, Skeleton],
  templateUrl: './park-catalog.html',
})
export class ParkCatalog {
  private readonly repository = inject(ParkRepository);
  private readonly reload = signal(0);

  private readonly request = toSignal(
    toObservable(this.reload).pipe(switchMap(() => toRequestState(this.repository.loadCatalog()))),
    { initialValue: { status: 'loading' } as RequestState<ParkSummary[]> },
  );

  readonly status = computed(() => this.request().status);

  readonly groups = computed<ParkGroup[]>(() => {
    const state = this.request();
    return state.status === 'loaded' ? groupByCountry(state.value) : [];
  });

  readonly parkCount = computed(() =>
    this.groups().reduce((total, group) => total + group.parks.length, 0),
  );

  retry(): void {
    this.reload.update((n) => n + 1);
  }
}
