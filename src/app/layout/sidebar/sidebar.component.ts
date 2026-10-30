import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Receipt,
  HandCoins,
  UserCircle,
  BarChart3,
  Settings,
  Wallet,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="brand">
        <div class="brand-icon">
          <lucide-angular [img]="WalletIcon" [size]="20"></lucide-angular>
        </div>
        <span class="brand-name" *ngIf="!collapsed">SplitWise Pro</span>
      </div>

      <nav class="nav-list" aria-label="Primary navigation">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
          <lucide-angular [img]="DashboardIcon" [size]="19"></lucide-angular>
          <span *ngIf="!collapsed">Dashboard</span>
        </a>
        <a routerLink="/groups" routerLinkActive="active" class="nav-item">
          <lucide-angular [img]="UsersIcon" [size]="19"></lucide-angular>
          <span *ngIf="!collapsed">Groups</span>
        </a>
        <a routerLink="/expenses" routerLinkActive="active" class="nav-item">
          <lucide-angular [img]="ReceiptIcon" [size]="19"></lucide-angular>
          <span *ngIf="!collapsed">Expenses</span>
        </a>
        <a routerLink="/settlements" routerLinkActive="active" class="nav-item">
          <lucide-angular [img]="HandCoinsIcon" [size]="19"></lucide-angular>
          <span *ngIf="!collapsed">Settlements</span>
        </a>
        <a routerLink="/members" routerLinkActive="active" class="nav-item">
          <lucide-angular [img]="UserCircleIcon" [size]="19"></lucide-angular>
          <span *ngIf="!collapsed">Members</span>
        </a>
        <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
          <lucide-angular [img]="BarChartIcon" [size]="19"></lucide-angular>
          <span *ngIf="!collapsed">Analytics</span>
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <lucide-angular [img]="SettingsIcon" [size]="19"></lucide-angular>
          <span *ngIf="!collapsed">Settings</span>
        </a>
      </nav>

      <button class="collapse-toggle" (click)="toggleCollapsed.emit()" [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <lucide-angular [img]="collapsed ? ChevronRightIcon : ChevronLeftIcon" [size]="16"></lucide-angular>
        <span *ngIf="!collapsed">Collapse</span>
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      transition: width 0.2s ease;
      flex-shrink: 0;
      z-index: 20;
    }
    .sidebar.collapsed { width: var(--sidebar-width-collapsed); }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px;
      height: var(--topbar-height);
      border-bottom: 1px solid var(--color-border);
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-name { font-weight: 800; font-size: 16px; white-space: nowrap; }

    .nav-list {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 12px;
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .nav-item:hover { background: var(--color-surface-alt); color: var(--color-text); }
    .nav-item.active { background: var(--color-primary-light); color: var(--color-primary-dark); }

    .collapse-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 12px;
      padding: 10px;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }
    .collapse-toggle:hover { color: var(--color-text); }

    @media (max-width: 992px) {
      .sidebar { display: none; }
    }
  `],
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapsed = new EventEmitter<void>();

  readonly WalletIcon = Wallet;
  readonly DashboardIcon = LayoutDashboard;
  readonly UsersIcon = Users;
  readonly ReceiptIcon = Receipt;
  readonly HandCoinsIcon = HandCoins;
  readonly UserCircleIcon = UserCircle;
  readonly BarChartIcon = BarChart3;
  readonly SettingsIcon = Settings;
  readonly ChevronLeftIcon = ChevronsLeft;
  readonly ChevronRightIcon = ChevronsRight;
}
