import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HistoricalMap } from '../../core/models';

const YEAR_BUTTON_PX = 50;
const CHROME_PX = 84;
const MAX_YEARS = 11;

@Component({
  selector: 'app-time-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden lg:block' },
  template: `
    <div class="rounded-xl border border-line bg-card px-3 py-2 shadow-md">
      <p
        class="mb-1.5 text-center font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft"
      >
        Time machine
      </p>

      @if (maps().length > 1) {
        <nav class="mb-1.5 flex justify-center gap-1" aria-label="Historical map">
          @for (entry of maps(); track entry.id) {
            <button
              type="button"
              (click)="mapPicked.emit(entry.id)"
              [attr.aria-pressed]="entry.id === selectedMapId()"
              class="rounded-lg px-2.5 py-1 font-display text-[11px] font-medium uppercase tracking-wide transition-colors"
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

      <div class="flex items-center gap-1">
        <button
          type="button"
          (click)="page(-1)"
          [disabled]="atStart()"
          aria-label="Earlier years"
          class="shrink-0 rounded-md p-1 text-ink-soft transition-colors hover:bg-parchment disabled:opacity-30"
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

        <div class="flex flex-1 justify-center gap-1">
          @for (year of windowYears(); track year) {
            <button
              type="button"
              (click)="yearPicked.emit(year)"
              [attr.aria-pressed]="year === current()"
              class="rounded-lg px-2 py-1 font-display text-xs font-semibold tabular-nums tracking-wide transition-colors"
              [class]="
                year === current()
                  ? 'bg-denim text-card'
                  : 'text-ink-soft hover:bg-parchment hover:text-ink'
              "
            >
              {{ year }}
            </button>
          }
        </div>

        <button
          type="button"
          (click)="page(1)"
          [disabled]="atEnd()"
          aria-label="Later years"
          class="shrink-0 rounded-md p-1 text-ink-soft transition-colors hover:bg-parchment disabled:opacity-30"
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
export class TimeBar {
  readonly maps = input.required<readonly HistoricalMap[]>();
  readonly selectedMapId = input<string | null>(null);
  readonly from = input.required<number>();
  readonly to = input.required<number>();
  readonly year = input.required<number | null>();

  readonly mapPicked = output<string>();
  readonly yearPicked = output<number>();

  private readonly capacity = signal(7);

  protected readonly current = computed(() => this.year() ?? this.to());

  protected readonly atStart = computed(() => this.current() <= this.from());
  protected readonly atEnd = computed(() => this.current() >= this.to());

  protected readonly windowYears = computed<number[]>(() => {
    const span = this.to() - this.from();
    if (span < 0) {
      return [this.from()];
    }
    const cap = this.capacity();
    const total = span + 1;
    const start =
      total <= cap
        ? this.from()
        : Math.max(
            this.from(),
            Math.min(this.current() - Math.floor(cap / 2), this.to() - cap + 1),
          );
    const end = Math.min(this.to(), start + Math.min(cap, total) - 1);
    const years: number[] = [];
    for (let year = start; year <= end; year++) {
      years.push(year);
    }
    return years;
  });

  constructor() {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const measure = (width: number) =>
        this.capacity.set(
          Math.min(MAX_YEARS, Math.max(3, Math.floor((width - CHROME_PX) / YEAR_BUTTON_PX))),
        );
      measure(host.getBoundingClientRect().width);
      const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected page(direction: -1 | 1): void {
    const next = this.current() + direction * this.capacity();
    this.yearPicked.emit(Math.max(this.from(), Math.min(this.to(), next)));
  }
}
