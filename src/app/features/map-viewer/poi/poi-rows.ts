import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { PointOfInterest } from '../../../core/models';
import { I18n } from '../../../core/i18n/i18n';
import { POI_COLOR } from './poi-style';

@Component({
  selector: 'app-poi-rows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './poi-rows.html',
})
export class PoiRows {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;

  readonly pois = input.required<readonly PointOfInterest[]>();
  readonly selectedId = input<string | null>(null);

  readonly picked = output<string>();

  protected readonly color = POI_COLOR;
}
