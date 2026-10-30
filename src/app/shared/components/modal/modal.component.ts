import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="modal-backdrop fade-in" *ngIf="open" (click)="close.emit()">
      <div
        class="modal-panel card-surface"
        [ngClass]="'modal-' + size"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="close.emit()" aria-label="Close dialog">
            <lucide-angular [img]="XIcon" [size]="20"></lucide-angular>
          </button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 12, 20, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-panel {
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }
    .modal-sm { max-width: 420px; }
    .modal-md { max-width: 560px; }
    .modal-lg { max-width: 760px; }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      background: var(--color-surface);
      z-index: 1;
    }
    .modal-header h3 { font-size: 18px; }
    .close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
      display: flex;
      padding: 6px;
      border-radius: 8px;
    }
    .close-btn:hover { background: var(--color-surface-alt); color: var(--color-text); }
    .modal-body { padding: 24px; }

    @media (max-width: 576px) {
      .modal-body, .modal-header { padding: 16px; }
    }
  `],
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() close = new EventEmitter<void>();

  readonly XIcon = X;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close.emit();
  }
}
