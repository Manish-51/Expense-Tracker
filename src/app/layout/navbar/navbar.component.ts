import { Component, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, History, Sun, Moon, Check } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RelativeTimePipe],
  template: `
    <header class="navbar">
      <div class="nav-actions">
        <div class="notif-wrap">
          <button
            class="action-btn"
            (click)="notifOpen = !notifOpen"
            aria-label="History and Activity"
          >
            <lucide-angular [img]="HistoryIcon" [size]="17"></lucide-angular>
            <span>History & Activity</span>
            <span class="dot" *ngIf="store.unreadNotificationsCount() > 0">
              {{ store.unreadNotificationsCount() }}
            </span>
          </button>

          <div class="notif-dropdown card-surface fade-in" *ngIf="notifOpen">
            <div class="notif-header">
              <h4>History & Activity</h4>
              <button class="link-btn" (click)="store.markAllNotificationsRead()">
                <lucide-angular [img]="CheckIcon" [size]="14"></lucide-angular>
                Mark all read
              </button>
            </div>
            <div class="notif-list">
              <div
                class="notif-item"
                *ngFor="let n of notifications().slice(0, 15)"
                [class.unread]="!n.read"
                (click)="store.markNotificationRead(n.id)"
              >
                <p>{{ n.message }}</p>
                <span class="text-muted-app time">{{ n.createdAt | relativeTime }}</span>
              </div>
              <p class="empty text-muted-app" *ngIf="notifications().length === 0">
                No activity history yet.
              </p>
            </div>
          </div>
        </div>

        <button
          class="action-btn"
          (click)="store.toggleTheme()"
          [attr.aria-label]="'Switch to ' + (store.theme() === 'light' ? 'dark' : 'light') + ' mode'"
        >
          <lucide-angular [img]="store.theme() === 'light' ? MoonIcon : SunIcon" [size]="17"></lucide-angular>
          <span>{{ store.theme() === 'light' ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: var(--topbar-height);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 15;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .action-btn:hover {
      background: var(--color-border);
    }

    .dot {
      background: var(--color-danger);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      line-height: 1;
    }

    .notif-wrap {
      position: relative;
    }
    .notif-dropdown {
      position: absolute;
      right: 0;
      top: 44px;
      width: 360px;
      max-height: 440px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
      z-index: 30;
      border-radius: var(--radius-md);
    }
    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--color-border);
    }
    .notif-header h4 {
      font-size: 14px;
      font-weight: 700;
    }
    .link-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .link-btn:hover {
      text-decoration: underline;
    }

    .notif-list {
      overflow-y: auto;
      padding: 6px;
      max-height: 360px;
    }
    .notif-item {
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: background-color 0.15s ease;
    }
    .notif-item:hover {
      background: var(--color-surface-alt);
    }
    .notif-item.unread {
      background: var(--color-primary-light);
    }
    .notif-item p {
      font-size: 13px;
      line-height: 1.4;
      margin: 0;
    }
    .notif-item .time {
      font-size: 11px;
    }
    .empty {
      padding: 24px;
      text-align: center;
      font-size: 13px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0 16px;
      }
      .action-btn span:not(.dot) {
        display: none;
      }
      .action-btn {
        padding: 8px 10px;
      }
      .notif-dropdown {
        width: 300px;
        right: -40px;
      }
    }
  `],
})
export class NavbarComponent {
  notifOpen = false;

  readonly HistoryIcon = History;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly CheckIcon = Check;

  notifications = computed(() => this.store.notifications());

  constructor(public store: StoreService) {}

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrap')) {
      this.notifOpen = false;
    }
  }
}
