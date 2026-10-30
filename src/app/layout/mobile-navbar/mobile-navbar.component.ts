import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Receipt,
  HandCoins,
  BarChart3,
} from 'lucide-angular';

@Component({
  selector: 'app-mobile-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="mobile-nav" aria-label="Mobile navigation">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <lucide-angular [img]="DashboardIcon" [size]="20"></lucide-angular>
        <span>Home</span>
      </a>
      <a routerLink="/groups" routerLinkActive="active">
        <lucide-angular [img]="UsersIcon" [size]="20"></lucide-angular>
        <span>Groups</span>
      </a>
      <a routerLink="/expenses" routerLinkActive="active">
        <lucide-angular [img]="ReceiptIcon" [size]="20"></lucide-angular>
        <span>Expenses</span>
      </a>
      <a routerLink="/settlements" routerLinkActive="active">
        <lucide-angular [img]="HandCoinsIcon" [size]="20"></lucide-angular>
        <span>Settle</span>
      </a>
      <a routerLink="/analytics" routerLinkActive="active">
        <lucide-angular [img]="BarChartIcon" [size]="20"></lucide-angular>
        <span>Stats</span>
      </a>
    </nav>
  `,
  styles: [`
    .mobile-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      z-index: 40;
      padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
    }
    .mobile-nav a {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 2px;
      color: var(--color-text-subtle);
      font-size: 10.5px;
      font-weight: 600;
      border-radius: 10px;
    }
    .mobile-nav a.active { color: var(--color-primary); }

    @media (max-width: 992px) {
      .mobile-nav { display: flex; }
    }
  `],
})
export class MobileNavbarComponent {
  readonly DashboardIcon = LayoutDashboard;
  readonly UsersIcon = Users;
  readonly ReceiptIcon = Receipt;
  readonly HandCoinsIcon = HandCoins;
  readonly BarChartIcon = BarChart3;
}
