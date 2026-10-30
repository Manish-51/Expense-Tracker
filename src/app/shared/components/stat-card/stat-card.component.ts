import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Reusable dashboard stat card.
 * Demonstrates prop-driven reusable UI:
 * <app-stat-card title="Total Expenses" [value]="24850 | currency" [icon]="WalletIcon" trend="+12%" tone="primary" />
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="stat-card card-surface fade-in">
      <div class="stat-top">
        <div class="icon-box" [ngClass]="'tone-' + tone">
          <lucide-angular [img]="icon" [size]="20"></lucide-angular>
        </div>
        <span class="trend" *ngIf="trend" [ngClass]="trendPositive ? 'trend-up' : 'trend-down'">
          {{ trend }}
        </span>
      </div>
      <p class="stat-value">{{ value }}</p>
      <p class="stat-title text-muted-app">{{ title }}</p>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tone-primary { background: var(--color-primary-light); color: var(--color-primary); }
    .tone-success { background: var(--color-success-light); color: var(--color-success); }
    .tone-danger { background: var(--color-danger-light); color: var(--color-danger); }
    .tone-warning { background: var(--color-warning-light); color: var(--color-warning); }
    .tone-info { background: var(--color-info-light); color: var(--color-info); }

    .trend { font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
    .trend-up { color: var(--color-success); background: var(--color-success-light); }
    .trend-down { color: var(--color-danger); background: var(--color-danger-light); }

    .stat-value { font-size: 26px; font-weight: 800; }
    .stat-title { font-size: 13px; font-weight: 500; }
  `],
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string = '';
  @Input() icon: any;
  @Input() trend?: string;
  @Input() tone: 'primary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';

  get trendPositive(): boolean {
    return !!this.trend && !this.trend.trim().startsWith('-');
  }
}
