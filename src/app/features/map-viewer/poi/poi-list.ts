import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { PoiCategory, PointOfInterest } from '../../../core/models';
import { PoiLegend, PoiLegendEntry } from './poi-legend';
import { PoiRows } from './poi-rows';

@Component({
  selector: 'app-poi-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [PoiLegend, PoiRows],
  templateUrl: './poi-list.html',
})
export class PoiList {
  readonly pois = input.required<readonly PointOfInterest[]>();
  readonly legend = input.required<readonly PoiLegendEntry[]>();
  readonly year = input<number | null>(null);
  readonly selectedId = input<string | null>(null);
  readonly takeFocus = input(false);

  readonly picked = output<string>();
  readonly toggleCategory = output<PoiCategory>();
  readonly showAll = output<void>();

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  constructor() {
    effect(() => {
      if (this.takeFocus()) {
        this.panel().nativeElement.focus();
      }
    });
  }
}
