import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { PoiCategory, PointOfInterest } from '../../../core/models';
import { PoiDetail } from '../poi/poi-detail';
import { PoiLegend, PoiLegendEntry } from '../poi/poi-legend';
import { PoiRows } from '../poi/poi-rows';

const PEEK_PX = 132;
const EXPAND_THRESHOLD = 0.5;

@Component({
  selector: 'app-mobile-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'md:hidden' },
  imports: [PoiDetail, PoiLegend, PoiRows],
  templateUrl: './mobile-bottom-sheet.html',
})
export class MobileBottomSheet {
  readonly pois = input.required<readonly PointOfInterest[]>();
  readonly legend = input.required<readonly PoiLegendEntry[]>();
  readonly year = input<number | null>(null);
  readonly selectedId = input<string | null>(null);
  readonly detail = input<PointOfInterest | null>(null);

  readonly picked = output<string>();
  readonly toggleCategory = output<PoiCategory>();
  readonly showAll = output<void>();
  readonly closeDetail = output<void>();

  private readonly sheet = viewChild.required<ElementRef<HTMLElement>>('sheet');

  protected readonly expanded = signal(false);
  protected readonly dragging = signal(false);
  protected readonly dragTranslate = signal<number | null>(null);

  private dragStartY = 0;
  private dragStartTranslate = 0;
  private collapsedTranslate = 0;
  private autoOpenedFor: string | null = null;

  protected readonly transform = computed(() => {
    const drag = this.dragTranslate();
    if (drag !== null) {
      return `translateY(${drag}px)`;
    }
    return this.expanded() ? 'translateY(0)' : `translateY(calc(100% - ${PEEK_PX}px))`;
  });

  constructor() {
    effect(() => {
      const poi = this.detail();
      if (poi && poi.id !== this.autoOpenedFor) {
        this.autoOpenedFor = poi.id;
        this.expanded.set(true);
      } else if (!poi) {
        this.autoOpenedFor = null;
      }
    });
  }

  protected toggle(): void {
    this.expanded.update((value) => !value);
  }

  protected onPointerDown(event: PointerEvent): void {
    const element = this.sheet().nativeElement;
    this.collapsedTranslate = Math.max(0, element.offsetHeight - PEEK_PX);
    this.dragStartTranslate = this.expanded() ? 0 : this.collapsedTranslate;
    this.dragStartY = event.clientY;
    this.dragTranslate.set(this.dragStartTranslate);
    this.dragging.set(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) {
      return;
    }
    const next = this.dragStartTranslate + (event.clientY - this.dragStartY);
    this.dragTranslate.set(Math.max(0, Math.min(this.collapsedTranslate, next)));
  }

  protected onPointerUp(): void {
    if (!this.dragging()) {
      return;
    }
    const translate = this.dragTranslate() ?? this.collapsedTranslate;
    const moved = Math.abs(translate - this.dragStartTranslate);
    if (moved < 4) {
      this.toggle();
    } else {
      this.expanded.set(translate < this.collapsedTranslate * EXPAND_THRESHOLD);
    }
    this.dragging.set(false);
    this.dragTranslate.set(null);
  }
}
