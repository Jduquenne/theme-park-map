import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PointOfInterest } from '../../../core/models';
import { POI_COLOR, POI_LABEL } from '../poi-style';

@Component({
  selector: 'app-poi-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './poi-list.html',
})
export class PoiList {
  readonly pois = input.required<readonly PointOfInterest[]>();
  readonly selectedId = input<string | null>(null);
  readonly picked = output<string>();

  protected readonly color = POI_COLOR;
  protected readonly label = POI_LABEL;
}
