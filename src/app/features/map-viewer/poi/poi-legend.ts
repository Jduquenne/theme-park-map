import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PoiCategory } from '../../../core/models';
import { POI_COLOR, POI_LABEL } from './poi-style';

export interface PoiLegendEntry {
  category: PoiCategory;
  count: number;
  hidden: boolean;
}

@Component({
  selector: 'app-poi-legend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './poi-legend.html',
})
export class PoiLegend {
  readonly entries = input.required<readonly PoiLegendEntry[]>();
  readonly toggle = output<PoiCategory>();

  protected readonly color = POI_COLOR;
  protected readonly label = POI_LABEL;
}
