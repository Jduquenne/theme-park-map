import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { HistoricalMap, Park, PoiCategory, PointOfInterest } from '../../core/models';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { LeafletMap } from './components/leaflet-map';
import { PoiLegend, PoiLegendEntry } from './components/poi-legend';
import { POI_LABEL } from './poi-style';
import { isActiveInYear, resolveOpenEnd } from './poi-visibility';

const CURRENT_YEAR = new Date().getFullYear();

@Component({
  selector: 'app-map-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [LeafletMap, PoiLegend],
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
  readonly hiddenCategories = signal<ReadonlySet<PoiCategory>>(new Set());

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

  private readonly datedPois = computed<PointOfInterest[]>(() => {
    const current = this.selectedMap();
    const year = this.activeYear();
    if (!current) {
      return [];
    }
    if (year === null) {
      return current.pointsOfInterest;
    }
    return current.pointsOfInterest.filter((poi) => isActiveInYear(poi.operating, year));
  });

  readonly legendEntries = computed<PoiLegendEntry[]>(() => {
    const counts = new Map<PoiCategory, number>();
    for (const poi of this.datedPois()) {
      counts.set(poi.category, (counts.get(poi.category) ?? 0) + 1);
    }
    const hidden = this.hiddenCategories();
    return [...counts.entries()]
      .map(([category, count]) => ({ category, count, hidden: hidden.has(category) }))
      .sort((a, b) => POI_LABEL[a.category].localeCompare(POI_LABEL[b.category]));
  });

  readonly visiblePois = computed(() => {
    const hidden = this.hiddenCategories();
    return this.datedPois().filter((poi) => !hidden.has(poi.category));
  });

  selectMap(id: string): void {
    this.selectedMapId.set(id);
    this.year.set(null);
  }

  scrubYear(event: Event): void {
    this.year.set(Number((event.target as HTMLInputElement).value));
  }

  toggleCategory(category: PoiCategory): void {
    this.hiddenCategories.update((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }
}
