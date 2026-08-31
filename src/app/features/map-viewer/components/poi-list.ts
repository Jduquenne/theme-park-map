import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PoiCategory, PointOfInterest } from '../../../core/models';
import { POI_COLOR, POI_LABEL } from '../poi-style';
import { PoiLegend, PoiLegendEntry } from './poi-legend';

@Component({
  selector: 'app-poi-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [PoiLegend],
  templateUrl: './poi-list.html',
})
export class PoiList {
  readonly pois = input.required<readonly PointOfInterest[]>();
  readonly legend = input.required<readonly PoiLegendEntry[]>();
  readonly selectedId = input<string | null>(null);

  readonly picked = output<string>();
  readonly toggleCategory = output<PoiCategory>();

  protected readonly color = POI_COLOR;
  protected readonly label = POI_LABEL;
}
