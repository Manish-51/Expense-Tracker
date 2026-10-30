import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-wrap" role="status" [attr.aria-label]="label">
      <div class="dot-spinner" [ngStyle]="{ width: size + 'px', height: size + 'px' }"></div>
      <span *ngIf="label" class="label text-muted-app">{{ label }}</span>
    </div>
  `,
  styles: [`
    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 32px;
    }
    .dot-spinner {
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .label { font-size: 13px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class LoadingSpinnerComponent {
  @Input() size = 32;
  @Input() label = 'Loading...';
}
