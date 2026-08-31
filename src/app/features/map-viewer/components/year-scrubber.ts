import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-year-scrubber',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center gap-4' },
  template: `
    <span class="w-12 text-xs tabular-nums text-slate-500">{{ from() }}</span>
    <input
      type="range"
      class="flex-1 accent-slate-900"
      aria-label="Year"
      [min]="from()"
      [max]="to()"
      [value]="value()"
      [attr.aria-valuetext]="value()"
      (input)="onInput($event)"
    />
    <span class="w-12 text-right text-xs tabular-nums text-slate-500">{{ to() }}</span>
    <span
      class="w-16 rounded bg-slate-900 px-2 py-1 text-center text-xs font-semibold tabular-nums text-white"
    >
      {{ value() }}
    </span>
  `,
})
export class YearScrubber {
  readonly from = input.required<number>();
  readonly to = input.required<number>();
  readonly value = input.required<number | null>();
  readonly yearPicked = output<number>();

  protected onInput(event: Event): void {
    this.yearPicked.emit(Number((event.target as HTMLInputElement).value));
  }
}
