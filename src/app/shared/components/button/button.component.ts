import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="app-btn"
      [ngClass]="['btn-' + variant, 'btn-' + size]"
      [type]="type"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading"
      (click)="onClick.emit($event)"
    >
      <span class="spinner" *ngIf="loading" aria-hidden="true"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .app-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      border: 1px solid transparent;
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.15s ease;
      white-space: nowrap;
    }
    .app-btn:active:not(:disabled) { transform: scale(0.97); }
    .app-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-md { padding: 10px 18px; font-size: 14px; }
    .btn-lg { padding: 13px 24px; font-size: 15px; }

    .btn-primary {
      background: var(--color-primary);
      color: #fff;
      box-shadow: var(--shadow-sm);
    }
    .btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }

    .btn-secondary {
      background: var(--color-surface-alt);
      color: var(--color-text);
      border-color: var(--color-border);
    }
    .btn-secondary:hover:not(:disabled) { background: var(--color-border); }

    .btn-danger {
      background: var(--color-danger);
      color: #fff;
    }
    .btn-danger:hover:not(:disabled) { filter: brightness(0.92); }

    .btn-outline {
      background: transparent;
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
    .btn-outline:hover:not(:disabled) { background: var(--color-primary-light); }

    .btn-ghost {
      background: transparent;
      color: var(--color-text-muted);
    }
    .btn-ghost:hover:not(:disabled) { background: var(--color-surface-alt); color: var(--color-text); }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
