import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable member avatar. Demonstrates @Input() props in Angular:
 * <app-avatar [name]="member.name" [color]="member.avatarColor" size="md" />
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="avatar"
      [ngClass]="'avatar-' + size"
      [style.background]="color || '#6366f1'"
      [title]="name"
      [attr.aria-label]="name"
    >
      {{ initials }}
    </div>
  `,
  styles: [`
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: #fff;
      font-weight: 600;
      flex-shrink: 0;
      user-select: none;
      border: 2px solid var(--color-surface);
    }
    .avatar-sm { width: 28px; height: 28px; font-size: 11px; }
    .avatar-md { width: 38px; height: 38px; font-size: 14px; }
    .avatar-lg { width: 56px; height: 56px; font-size: 18px; }
  `],
})
export class AvatarComponent {
  @Input() name = '';
  @Input() color = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
