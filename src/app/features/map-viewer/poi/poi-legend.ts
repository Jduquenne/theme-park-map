import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PoiCategory } from '../../../core/models';
import { I18n } from '../../../core/i18n/i18n';
import { POI_COLOR } from './poi-style';

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
  protected readonly t = inject(I18n).t;

  readonly entries = input.required<readonly PoiLegendEntry[]>();
  readonly toggle = output<PoiCategory>();
  readonly showAll = output<void>();

  protected readonly color = POI_COLOR;

  protected readonly allActive = computed(() => this.entries().every((entry) => !entry.hidden));
}
