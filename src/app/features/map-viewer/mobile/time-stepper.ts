import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { HistoricalMap } from '../../../core/models';

@Component({
  selector: 'app-time-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block lg:hidden' },
  template: `
    <div class="rounded-xl border border-line bg-card px-1.5 py-1 shadow-md">
      @if (maps().length > 1) {
        <nav class="mb-1 flex gap-1 overflow-x-auto" aria-label="Historical map">
          @for (entry of maps(); track entry.id) {
            <button
              type="button"
              (click)="mapPicked.emit(entry.id)"
              [attr.aria-pressed]="entry.id === selectedMapId()"
              class="shrink-0 rounded-lg px-2 py-0.5 font-display text-[10px] font-medium uppercase tracking-wide transition-colors"
              [class]="
                entry.id === selectedMapId()
                  ? 'bg-denim text-card'
                  : 'text-ink-soft hover:bg-parchment hover:text-ink'
              "
            >
              {{ entry.title }}
            </button>
          }
        </nav>
      }

      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          (click)="step(-1)"
          [disabled]="atStart()"
          aria-label="Previous year"
          class="shrink-0 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-parchment disabled:opacity-30"
        >
          <svg
            viewBox="0 0 16 16"
            class="size-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M10 3l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <span
          aria-live="polite"
          class="font-display text-sm font-semibold tabular-nums tracking-wide text-ink"
        >
          {{ current() }}
        </span>

        <button
          type="button"
          (click)="step(1)"
          [disabled]="atEnd()"
          aria-label="Next year"
          class="shrink-0 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-parchment disabled:opacity-30"
        >
          <svg
            viewBox="0 0 16 16"
            class="size-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 3l5 5-5 5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class TimeStepper {
  readonly maps = input.required<readonly HistoricalMap[]>();
  readonly selectedMapId = input<string | null>(null);
  readonly from = input.required<number>();
  readonly to = input.required<number>();
  readonly year = input.required<number | null>();

  readonly mapPicked = output<string>();
  readonly yearPicked = output<number>();

  protected readonly current = computed(() => this.year() ?? this.to());
  protected readonly atStart = computed(() => this.current() <= this.from());
  protected readonly atEnd = computed(() => this.current() >= this.to());

  protected step(direction: -1 | 1): void {
    const next = this.current() + direction;
    this.yearPicked.emit(Math.max(this.from(), Math.min(this.to(), next)));
  }
}
