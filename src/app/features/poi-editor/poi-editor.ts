import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import {
  HistoricalMap,
  Park,
  PixelPoint,
  PoiCategory,
  PointOfInterest,
  YearRange,
} from '../../core/models';
import { LeafletMap } from '../map-viewer/leaflet-map';
import { POI_LABEL } from '../map-viewer/poi/poi-style';

const CATEGORIES: PoiCategory[] = [
  'attraction',
  'show',
  'dining',
  'shop',
  'service',
  'entrance',
  'landmark',
];

function nextPoiId(): string {
  return `poi-${crypto.randomUUID().slice(0, 8)}`;
}

@Component({
  selector: 'app-poi-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-0 flex-1 flex-col',
    '(window:beforeunload)': 'confirmUnload($event)',
  },
  imports: [LeafletMap],
  templateUrl: './poi-editor.html',
})
export class PoiEditor {
  readonly slug = input.required<string>();

  protected readonly categories = CATEGORIES;
  protected readonly categoryLabel = POI_LABEL;
  protected readonly fileSystemAccessSupported = 'showOpenFilePicker' in window;

  protected readonly park = signal<Park | null>(null);
  protected readonly fileHandle = signal<FileSystemFileHandle | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly dirty = signal(false);

  protected readonly selectedMapId = signal<string | null>(null);
  protected readonly selectedPoiId = signal<string | null>(null);
  protected readonly placementActive = signal(false);

  protected readonly slugMismatch = computed(() => {
    const park = this.park();
    return park !== null && park.slug !== this.slug();
  });

  protected readonly maps = computed(() => this.park()?.maps ?? []);

  protected readonly selectedMap = computed<HistoricalMap | null>(() => {
    const maps = this.maps();
    if (maps.length === 0) {
      return null;
    }
    return maps.find((entry) => entry.id === this.selectedMapId()) ?? maps[0];
  });

  protected readonly pointsOfInterest = computed(() => this.selectedMap()?.pointsOfInterest ?? []);

  protected readonly selectedPoi = computed<PointOfInterest | null>(() => {
    const id = this.selectedPoiId();
    return id === null ? null : (this.pointsOfInterest().find((poi) => poi.id === id) ?? null);
  });

  protected readonly selectedPoiIsNew = computed(() => {
    const poi = this.selectedPoi();
    const map = this.selectedMap();
    if (!poi || !map || !poi.operating) {
      return false;
    }
    return poi.operating.from === map.period.from;
  });

  protected readonly copySources = computed(() => {
    const current = this.selectedMap();
    return this.maps()
      .filter((entry) => entry.id !== current?.id && entry.pointsOfInterest.length > 0)
      .sort((a, b) => b.period.from - a.period.from);
  });

  protected readonly defaultCopySourceId = computed(() => {
    const current = this.selectedMap();
    const sources = this.copySources();
    if (!current) {
      return sources[0]?.id ?? null;
    }
    return (sources.find((entry) => entry.period.from < current.period.from) ?? sources[0])?.id ?? null;
  });

  async openFile(): Promise<void> {
    this.loadError.set(null);
    try {
      const [handle] = await window.showOpenFilePicker!({
        types: [
          {
            description: 'Park JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const parsed = JSON.parse(await file.text()) as Park;
      this.fileHandle.set(handle);
      this.park.set(parsed);
      this.selectedMapId.set(parsed.maps[0]?.id ?? null);
      this.selectedPoiId.set(null);
      this.placementActive.set(false);
      this.dirty.set(false);
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      this.loadError.set(
        'Could not read that file as a park JSON. Pick public/data/<slug>.json.',
      );
    }
  }

  async save(): Promise<void> {
    const handle = this.fileHandle();
    const park = this.park();
    if (!handle || !park) {
      return;
    }
    this.saving.set(true);
    try {
      const writable = await handle.createWritable();
      await writable.write(`${JSON.stringify(park, null, 2)}\n`);
      await writable.close();
      this.dirty.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  selectMap(id: string): void {
    this.selectedMapId.set(id);
    this.selectedPoiId.set(null);
    this.placementActive.set(false);
  }

  pickPoi(id: string): void {
    this.placementActive.set(false);
    this.selectedPoiId.update((current) => (current === id ? null : id));
  }

  togglePlacement(): void {
    this.placementActive.update((active) => !active);
  }

  copyFrom(sourceId: string): void {
    const current = this.selectedMap();
    const source = this.maps().find((entry) => entry.id === sourceId);
    if (!current || !source) {
      return;
    }
    if (current.pointsOfInterest.length > 0) {
      const confirmed = window.confirm(
        `Replace the ${current.pointsOfInterest.length} attraction(s) already on "${current.title}" with a copy of the ${source.pointsOfInterest.length} from "${source.title}"?`,
      );
      if (!confirmed) {
        return;
      }
    }
    const copied = source.pointsOfInterest.map((poi) => ({
      ...poi,
      id: nextPoiId(),
      position: { ...poi.position },
    }));
    this.mutateSelectedMap((map) => ({ ...map, pointsOfInterest: copied }));
    this.selectedPoiId.set(null);
  }

  placePoi(position: PixelPoint): void {
    const map = this.selectedMap();
    if (!map) {
      return;
    }
    const poi: PointOfInterest = {
      id: nextPoiId(),
      name: 'New attraction',
      category: 'attraction',
      position,
      description: null,
      operating: { from: map.period.from, to: null },
    };
    this.mutateSelectedMap((current) => ({
      ...current,
      pointsOfInterest: [...current.pointsOfInterest, poi],
    }));
    this.selectedPoiId.set(poi.id);
    this.placementActive.set(false);
  }

  movePoi(event: { id: string; position: PixelPoint }): void {
    this.updatePoi(event.id, { position: event.position });
  }

  updateName(name: string): void {
    const poi = this.selectedPoi();
    if (poi) {
      this.updatePoi(poi.id, { name });
    }
  }

  updateCategory(category: PoiCategory): void {
    const poi = this.selectedPoi();
    if (poi) {
      this.updatePoi(poi.id, { category });
    }
  }

  updateDescription(description: string): void {
    const poi = this.selectedPoi();
    if (poi) {
      this.updatePoi(poi.id, { description: description.trim() === '' ? null : description });
    }
  }

  updateOperatingFrom(value: string): void {
    const poi = this.selectedPoi();
    const from = Number(value);
    if (poi && Number.isFinite(from)) {
      const operating: YearRange = { from, to: poi.operating?.to ?? null };
      this.updatePoi(poi.id, { operating });
    }
  }

  updateOperatingTo(value: string): void {
    const poi = this.selectedPoi();
    if (!poi) {
      return;
    }
    const to = value.trim() === '' ? null : Number(value);
    const operating: YearRange = { from: poi.operating?.from ?? this.selectedMap()!.period.from, to };
    this.updatePoi(poi.id, { operating });
  }

  removePoi(id: string): void {
    this.mutateSelectedMap((map) => ({
      ...map,
      pointsOfInterest: map.pointsOfInterest.filter((poi) => poi.id !== id),
    }));
    if (this.selectedPoiId() === id) {
      this.selectedPoiId.set(null);
    }
  }

  confirmUnload(event: BeforeUnloadEvent): void {
    if (this.dirty()) {
      event.preventDefault();
    }
  }

  private updatePoi(id: string, patch: Partial<PointOfInterest>): void {
    this.mutateSelectedMap((map) => ({
      ...map,
      pointsOfInterest: map.pointsOfInterest.map((poi) =>
        poi.id === id ? { ...poi, ...patch } : poi,
      ),
    }));
  }

  private mutateSelectedMap(updater: (map: HistoricalMap) => HistoricalMap): void {
    const park = this.park();
    const mapId = this.selectedMap()?.id;
    if (!park || !mapId) {
      return;
    }
    this.park.set({
      ...park,
      maps: park.maps.map((entry) => (entry.id === mapId ? updater(entry) : entry)),
    });
    this.dirty.set(true);
  }
}
