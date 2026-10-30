import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="empty-state fade-in">
      <div class="icon-wrap" *ngIf="icon">
        <lucide-angular [img]="icon" [size]="32"></lucide-angular>
      </div>
      <h4>{{ title }}</h4>
      <p class="text-muted-app">{{ description }}</p>
      <div class="action-slot">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
      gap: 8px;
    }
    .icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    h4 { font-size: 16px; }
    p { font-size: 14px; max-width: 340px; }
    .action-slot { margin-top: 12px; }
  `],
})
export class EmptyStateComponent {
  @Input() icon: any = null;
  @Input() title = 'Nothing here yet';
  @Input() description = '';
}
