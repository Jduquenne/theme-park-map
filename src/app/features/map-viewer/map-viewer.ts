import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { combineLatest, debounceTime, switchMap } from 'rxjs';
import { HistoricalMap, Park, PoiCategory, PointOfInterest } from '../../core/models';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import { Skeleton } from '../../shared/components/skeleton';
import { LeafletMap } from './components/leaflet-map';
import { PoiDetail } from './components/poi-detail';
import { PoiLegendEntry } from './components/poi-legend';
import { PoiList } from './components/poi-list';
import { POI_LABEL } from './poi-style';
import { isActiveInYear, resolveOpenEnd } from './poi-visibility';

const CURRENT_YEAR = new Date().getFullYear();

@Component({
  selector: 'app-map-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [LeafletMap, PoiDetail, PoiList, Skeleton, RouterLink],
  templateUrl: './map-viewer.html',
})
export class MapViewer {
  private readonly repository = inject(ParkRepository);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly slug = input.required<string>();

  private readonly reload = signal(0);

  private readonly request = toSignal(
    combineLatest([toObservable(this.slug), toObservable(this.reload)]).pipe(
      switchMap(([slug]) => toRequestState(this.repository.loadPark(slug))),
    ),
    { initialValue: { status: 'loading' } as RequestState<Park> },
  );

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly returnFocusToList = signal(false);

  readonly status = computed(() => this.request().status);

  readonly park = computed<Park | null>(() => {
    const state = this.request();
    return state.status === 'loaded' ? state.value : null;
  });

  readonly maps = computed(() => this.park()?.maps ?? []);

  readonly selectedMapId = linkedSignal(() => this.queryParams().get('map'));
  readonly selectedPoiId = linkedSignal(() => this.queryParams().get('poi'));
  readonly year = linkedSignal(() => {
    const raw = this.queryParams().get('year');
    return raw === null ? null : Number(raw);
  });
  readonly hiddenCategories = linkedSignal<ReadonlySet<PoiCategory>>(() => {
    const raw = this.queryParams().get('hide');
    return new Set((raw ? raw.split(',') : []) as PoiCategory[]);
  });

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

  readonly selectedPoi = computed<PointOfInterest | null>(() => {
    const id = this.selectedPoiId();
    return id === null ? null : (this.visiblePois().find((poi) => poi.id === id) ?? null);
  });

  private readonly urlState = computed<Params>(() => {
    const hidden = [...this.hiddenCategories()];
    return {
      map: this.selectedMapId(),
      year: this.year(),
      poi: this.selectedPoiId(),
      hide: hidden.length ? hidden.join(',') : null,
    };
  });

  constructor() {
    toObservable(this.urlState)
      .pipe(debounceTime(150), takeUntilDestroyed())
      .subscribe((queryParams) =>
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams,
          queryParamsHandling: 'merge',
          replaceUrl: true,
        }),
      );
  }

  retry(): void {
    this.reload.update((n) => n + 1);
  }

  selectMap(id: string): void {
    this.selectedMapId.set(id);
    this.selectedPoiId.set(null);
    this.year.set(null);
    this.returnFocusToList.set(false);
  }

  pickPoi(id: string): void {
    this.selectedPoiId.update((current) => (current === id ? null : id));
    this.returnFocusToList.set(false);
  }

  clearPoi(): void {
    this.selectedPoiId.set(null);
    this.returnFocusToList.set(true);
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
