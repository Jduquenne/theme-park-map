import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { HistoricalMap, Park, PoiCategory, PointOfInterest } from '../../core/models';
import { ParkRepository } from '../../core/services/park-repository';
import { RequestState, toRequestState } from '../../shared/http/request-state';
import {
  QueryParamCodec,
  numberParam,
  queryParamsState,
  stringParam,
} from '../../shared/router/query-params-state';
import { formatCount } from '../../shared/text/format-count';
import { Skeleton } from '../../shared/components/skeleton';
import { LeafletMap } from './leaflet-map';
import { TimeBar } from './time-bar';
import { MobileBottomSheet } from './mobile/mobile-bottom-sheet';
import { ParkMenu } from './mobile/park-menu';
import { TimeStepper } from './mobile/time-stepper';
import { PoiDetail } from './poi/poi-detail';
import { PoiLegendEntry } from './poi/poi-legend';
import { PoiList } from './poi/poi-list';
import { POI_LABEL } from './poi/poi-style';
import { isActiveInYear, resolveOpenEnd } from './poi/poi-visibility';

const CURRENT_YEAR = new Date().getFullYear();

const categorySetParam: QueryParamCodec<ReadonlySet<PoiCategory>> = {
  parse: (raw) => new Set((raw ? raw.split(',') : []) as PoiCategory[]),
  serialize: (value) => [...value].join(',') || null,
};

@Component({
  selector: 'app-map-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-0 flex-1 flex-col',
    '(document:fullscreenchange)': 'syncFullscreen()',
  },
  imports: [
    LeafletMap,
    TimeBar,
    TimeStepper,
    MobileBottomSheet,
    ParkMenu,
    PoiDetail,
    PoiList,
    Skeleton,
    RouterLink,
  ],
  templateUrl: './map-viewer.html',
})
export class MapViewer {
  private readonly repository = inject(ParkRepository);

  readonly slug = input.required<string>();

  private readonly mapRegion = viewChild<ElementRef<HTMLElement>>('mapRegion');
  readonly isFullscreen = signal(false);

  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  readonly menuOpen = signal(false);

  private readonly reload = signal(0);

  private readonly request = toSignal(
    combineLatest([toObservable(this.slug), toObservable(this.reload)]).pipe(
      switchMap(([slug]) => toRequestState(this.repository.loadPark(slug))),
    ),
    { initialValue: { status: 'loading' } as RequestState<Park> },
  );

  private readonly params = queryParamsState({
    map: stringParam,
    poi: stringParam,
    year: numberParam,
    hide: categorySetParam,
  });

  readonly selectedMapId = this.params.map;
  readonly selectedPoiId = this.params.poi;
  readonly year = this.params.year;
  readonly hiddenCategories = this.params.hide;

  readonly returnFocusToList = signal(false);

  readonly status = computed(() => this.request().status);

  readonly park = computed<Park | null>(() => {
    const state = this.request();
    return state.status === 'loaded' ? state.value : null;
  });

  readonly attendanceLabel = computed(() => {
    const attendance = this.park()?.attendance;
    if (!attendance) {
      return null;
    }
    const count = formatCount(attendance.visitors);
    return attendance.year
      ? `≈ ${count} visitors (${attendance.year})`
      : `≈ ${count} visitors / year`;
  });

  readonly maps = computed(() => this.park()?.maps ?? []);

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

  constructor() {
    effect(() => {
      this.slug();
      this.menuOpen.set(false);
    });
  }

  retry(): void {
    this.reload.update((n) => n + 1);
  }

  openMenu(): void {
    this.menuOpen.set(true);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.menuButton()?.nativeElement.focus();
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

  showAllCategories(): void {
    this.hiddenCategories.set(new Set());
  }

  toggleFullscreen(): void {
    const el = this.mapRegion()?.nativeElement;
    if (!el) {
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  }

  syncFullscreen(): void {
    this.isFullscreen.set(document.fullscreenElement !== null);
  }
}
