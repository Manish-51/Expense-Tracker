import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="'badge-' + variant">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-primary { background: var(--color-primary-light); color: var(--color-primary-dark); }
    .badge-success { background: var(--color-success-light); color: var(--color-success); }
    .badge-danger { background: var(--color-danger-light); color: var(--color-danger); }
    .badge-warning { background: var(--color-warning-light); color: var(--color-warning); }
    .badge-info { background: var(--color-info-light); color: var(--color-info); }
    .badge-neutral { background: var(--color-surface-alt); color: var(--color-text-muted); border: 1px solid var(--color-border); }
  `],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
}
