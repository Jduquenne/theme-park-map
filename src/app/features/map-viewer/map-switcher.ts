import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HistoricalMap } from '../../core/models';

@Component({
  selector: 'app-map-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav class="flex gap-1" aria-label="Historical map">
      @for (entry of maps(); track entry.id) {
        <button
          type="button"
          (click)="selected.emit(entry.id)"
          [attr.aria-pressed]="entry.id === selectedId()"
          class="rounded px-3 py-1 text-xs font-medium transition-colors"
          [class]="
            entry.id === selectedId()
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          "
        >
          {{ entry.title }}
        </button>
      }
    </nav>
  `,
})
export class MapSwitcher {
  readonly maps = input.required<readonly HistoricalMap[]>();
  readonly selectedId = input<string | null>(null);
  readonly selected = output<string>();
}
