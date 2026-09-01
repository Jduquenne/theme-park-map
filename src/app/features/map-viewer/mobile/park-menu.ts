import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ParkIndex } from '../../park-index/park-index';

@Component({
  selector: 'app-park-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
    '(document:keydown.escape)': 'onEscape()',
  },
  imports: [ParkIndex],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[2000] flex flex-col bg-parchment lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Parks index"
      >
        <div class="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
          <span class="font-display text-base font-semibold uppercase tracking-[0.16em] text-ink">
            Park Map History
          </span>
          <button
            #closeButton
            type="button"
            (click)="closed.emit()"
            aria-label="Close the parks index"
            class="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-card hover:text-ink"
          >
            <svg
              viewBox="0 0 16 16"
              class="size-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <app-park-index class="min-h-0 flex-1" />
      </div>
    }
  `,
})
export class ParkMenu {
  readonly open = input.required<boolean>();
  readonly closed = output<void>();

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    effect(() => {
      this.closeButton()?.nativeElement.focus();
    });
  }

  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
