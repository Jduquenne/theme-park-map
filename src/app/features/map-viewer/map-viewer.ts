import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { HistoricalMap, Park } from '../../core/models';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { LeafletMap } from './components/leaflet-map';
import { POI_LABEL } from './poi-style';
import { isActiveInYear, resolveOpenEnd } from './poi-visibility';

const CURRENT_YEAR = new Date().getFullYear();

@Component({
  selector: 'app-map-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [LeafletMap],
  templateUrl: './map-viewer.html',
})
export class MapViewer {
  private readonly repository = inject(ParkRepository);

  readonly slug = input.required<string>();

  private readonly request = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) => toRequestState(this.repository.loadPark(slug))),
    ),
    { initialValue: { status: 'loading' } as RequestState<Park> },
  );

  readonly status = computed(() => this.request().status);

  readonly park = computed<Park | null>(() => {
    const state = this.request();
    return state.status === 'loaded' ? state.value : null;
  });

  readonly maps = computed(() => this.park()?.maps ?? []);

  readonly selectedMapId = signal<string | null>(null);
  readonly year = signal<number | null>(null);

  readonly selectedMap = computed<HistoricalMap | null>(() => {
    const maps = this.maps();
    if (maps.length === 0) {
      return null;
    }
    return maps.find((entry) => entry.id === this.selectedMapId()) ?? maps[0];
  });

  readonly timeline = computed(() => {
    const current = this.selectedMap();
    if (!current) {
      return null;
    }
    return { from: current.period.from, to: resolveOpenEnd(current.period, CURRENT_YEAR) };
  });

  readonly activeYear = computed(() => this.year() ?? this.timeline()?.to ?? null);

  readonly visiblePois = computed(() => {
    const current = this.selectedMap();
    const year = this.activeYear();
    if (!current || year === null) {
      return current?.pointsOfInterest ?? [];
    }
    return current.pointsOfInterest.filter((poi) => isActiveInYear(poi.operating, year));
  });

  readonly legend = POI_LABEL;

  selectMap(id: string): void {
    this.selectedMapId.set(id);
    this.year.set(null);
  }

  scrubYear(event: Event): void {
    this.year.set(Number((event.target as HTMLInputElement).value));
  }
}
