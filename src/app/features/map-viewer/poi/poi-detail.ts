import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PointOfInterest } from '../../../core/models';
import { I18n } from '../../../core/i18n/i18n';
import { POI_COLOR } from './poi-style';

@Component({
  selector: 'app-poi-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './poi-detail.html',
})
export class PoiDetail {
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  readonly poi = input.required<PointOfInterest>();
  readonly closed = output<void>();

  protected readonly color = computed(() => POI_COLOR[this.poi().category]);
  protected readonly categoryLabel = computed(() => this.t().poiCategory[this.poi().category]);
  protected readonly description = computed(() => this.i18n.localize(this.poi().description));

  protected readonly activeYears = computed(() => {
    const operating = this.poi().operating;
    return operating ? this.t().poi.activeYears(operating.from, operating.to) : null;
  });
}
