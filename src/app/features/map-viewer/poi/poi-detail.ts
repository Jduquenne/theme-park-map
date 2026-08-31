import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PointOfInterest } from '../../../core/models';
import { POI_COLOR, POI_LABEL } from './poi-style';

@Component({
  selector: 'app-poi-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './poi-detail.html',
})
export class PoiDetail {
  readonly poi = input.required<PointOfInterest>();
  readonly closed = output<void>();

  protected readonly color = computed(() => POI_COLOR[this.poi().category]);
  protected readonly categoryLabel = computed(() => POI_LABEL[this.poi().category]);

  protected readonly activeYears = computed(() => {
    const operating = this.poi().operating;
    if (!operating) {
      return null;
    }
    return `${operating.from}–${operating.to ?? 'present'}`;
  });
}
