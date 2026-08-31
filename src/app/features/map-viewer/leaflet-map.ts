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
  divIcon,
  imageOverlay,
  layerGroup,
  marker,
  map as createMap,
} from 'leaflet';
import { MapImage, PoiCategory, PointOfInterest } from '../../core/models';
import { imageBounds, imagePointToLatLng } from './image-coordinates';
import { POI_COLOR } from './poi/poi-style';

function pinIcon(category: PoiCategory, selected: boolean) {
  const size = selected ? 40 : 30;
  const height = Math.round(size * 1.3);
  const shadow = selected ? 'filter:drop-shadow(0 3px 4px rgb(40 38 33 / 0.4));' : '';
  const html = `<svg width="${size}" height="${height}" viewBox="0 0 24 32" style="${shadow}" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${POI_COLOR[category]}" stroke="#fffdf7" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.2" fill="#fffdf7"/>
  </svg>`;
  return divIcon({
    html,
    className: '',
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    tooltipAnchor: [0, -height + 6],
  });
}

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
  private fittedBounds: ReturnType<typeof imageBounds> | null = null;
  private readonly markers: LayerGroup = layerGroup();
  private readonly prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const resize = new ResizeObserver(() => this.refit());
    resize.observe(host);

    this.destroyRef.onDestroy(() => {
      resize.disconnect();
      this.map?.remove();
      this.map = null;
    });

    this.ready.set(true);
  }

  private refit(): void {
    if (!this.map) {
      return;
    }
    this.map.invalidateSize({ animate: false });
    if (this.fittedBounds) {
      this.map.fitBounds(this.fittedBounds, { animate: false });
    }
  }

  private renderImage(image: MapImage): void {
    if (!this.map) {
      return;
    }
    const bounds = imageBounds(image);
    this.fittedBounds = bounds;
    const outgoing = this.overlay;
    const incoming = imageOverlay(image.path, bounds, { opacity: outgoing ? 0 : 1 }).addTo(
      this.map,
    );

    this.overlay = incoming;
    this.map.setMaxBounds(bounds.pad(1));

    if (!outgoing || this.prefersReducedMotion) {
      outgoing?.remove();
      incoming.setOpacity(1);
      this.map.fitBounds(bounds);
      requestAnimationFrame(() => this.refit());
      return;
    }

    this.map.flyToBounds(bounds, { duration: 0.4 });
    requestAnimationFrame(() => {
      incoming.setOpacity(1);
      outgoing.setOpacity(0);
    });
    window.setTimeout(() => {
      if (this.map) {
        outgoing.remove();
      }
    }, 500);
  }

  private renderMarkers(pois: readonly PointOfInterest[], selectedId: string | null): void {
    const image = this.image();
    this.markers.clearLayers();
    for (const poi of pois) {
      const selected = poi.id === selectedId;
      marker(imagePointToLatLng(poi.position, image), {
        icon: pinIcon(poi.category, selected),
        zIndexOffset: selected ? 1000 : 0,
        keyboard: false,
      })
        .bindTooltip(poi.name, { direction: 'top' })
        .on('click', () => this.poiPicked.emit(poi.id))
        .addTo(this.markers);
    }
  }
}
