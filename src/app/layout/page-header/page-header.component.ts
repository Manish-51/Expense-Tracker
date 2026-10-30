import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ title }}</h1>
        <p class="text-muted-app" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    h1 { font-size: 24px; }
    p { font-size: 14px; margin-top: 4px; }
    .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

    @media (max-width: 576px) {
      h1 { font-size: 20px; }
    }
  `],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
