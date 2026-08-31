import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  CRS,
  ImageOverlay,
  LayerGroup,
  Map as LeafletMapInstance,
  circleMarker,
  imageOverlay,
  layerGroup,
  map as createMap,
} from 'leaflet';
import { MapImage, PointOfInterest } from '../../../core/models';
import { imageBounds, imagePointToLatLng } from '../image-coordinates';
import { POI_COLOR } from '../poi-style';

@Component({
  selector: 'app-leaflet-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `<div #canvas class="h-full w-full"></div>`,
})
export class LeafletMap {
  readonly image = input.required<MapImage>();
  readonly pointsOfInterest = input<readonly PointOfInterest[]>([]);
  readonly selectedPoiId = input<string | null>(null);

  readonly poiPicked = output<string>();

  private readonly canvas = viewChild.required<ElementRef<HTMLElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  private readonly ready = signal(false);

  private map: LeafletMapInstance | null = null;
  private overlay: ImageOverlay | null = null;
  private readonly markers: LayerGroup = layerGroup();

  constructor() {
    afterNextRender(() => this.initialize());

    effect(() => {
      const image = this.image();
      if (this.ready()) {
        this.renderImage(image);
      }
    });

    effect(() => {
      const pois = this.pointsOfInterest();
      const selectedId = this.selectedPoiId();
      if (this.ready()) {
        this.renderMarkers(pois, selectedId);
      }
    });
  }

  private initialize(): void {
    const host = this.canvas().nativeElement;
    this.map = createMap(host, {
      crs: CRS.Simple,
      minZoom: -5,
      zoomSnap: 0,
      attributionControl: false,
    });
    this.markers.addTo(this.map);

    const resize = new ResizeObserver(() => this.map?.invalidateSize());
    resize.observe(host);

    this.destroyRef.onDestroy(() => {
      resize.disconnect();
      this.map?.remove();
      this.map = null;
    });

    this.ready.set(true);
  }

  private renderImage(image: MapImage): void {
    if (!this.map) {
      return;
    }
    const bounds = imageBounds(image);
    this.overlay?.remove();
    this.overlay = imageOverlay(image.path, bounds).addTo(this.map);
    this.map.setMaxBounds(bounds);
    this.map.fitBounds(bounds);
  }

  private renderMarkers(pois: readonly PointOfInterest[], selectedId: string | null): void {
    const image = this.image();
    this.markers.clearLayers();
    for (const poi of pois) {
      const selected = poi.id === selectedId;
      circleMarker(imagePointToLatLng(poi.position, image), {
        radius: selected ? 10 : 7,
        weight: selected ? 3 : 2,
        color: selected ? '#0f172a' : '#ffffff',
        fillColor: POI_COLOR[poi.category],
        fillOpacity: 1,
      })
        .bindTooltip(poi.name, { direction: 'top', offset: [0, -8] })
        .on('click', () => this.poiPicked.emit(poi.id))
        .addTo(this.markers);
    }
  }
}
