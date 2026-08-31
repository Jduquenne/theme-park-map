import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block animate-pulse rounded bg-line/70', 'aria-hidden': 'true' },
  template: '',
})
export class Skeleton {}
