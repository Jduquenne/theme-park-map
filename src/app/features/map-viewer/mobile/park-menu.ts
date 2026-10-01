import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { I18n } from '../../../core/i18n/i18n';
import { LanguageSwitcher } from '../../../shared/components/language-switcher';
import { ParkIndex } from '../../park-index/park-index';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-park-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
    '(document:keydown.escape)': 'onEscape()',
  },
  imports: [ParkIndex, LanguageSwitcher],
  template: `
    @if (open()) {
      <div
        #panel
        class="fixed inset-0 z-2000 flex flex-col bg-parchment pt-[env(safe-area-inset-top)] lg:hidden"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="t().parkIndex.title"
        (keydown)="onKeydown($event)"
      >
        <div class="flex shrink-0 items-center gap-2 border-b border-line px-4 py-3">
          <span
            class="mr-auto font-display text-base font-semibold uppercase tracking-[0.16em] text-ink"
          >
            Park Map History
          </span>
          <app-language-switcher />
          <button
            #closeButton
            type="button"
            (click)="closed.emit()"
            [attr.aria-label]="t().mapViewer.closeIndex"
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
  protected readonly t = inject(I18n).t;

  readonly open = input.required<boolean>();
  readonly closed = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    effect(() => {
      this.closeButton()?.nativeElement.focus();
    });

    effect((onCleanup) => {
      if (!this.open()) {
        return;
      }
      const { body } = this.document;
      const previousOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
      onCleanup(() => {
        body.style.overflow = previousOverflow;
      });
    });
  }

  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return;
    }
    const stops = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (element) => element.offsetParent !== null,
    );
    if (stops.length === 0) {
      return;
    }
    const first = stops[0];
    const last = stops[stops.length - 1];
    const active = this.document.activeElement;
    if (event.shiftKey && (active === first || !panel.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
