import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MoreVertical, Pencil, Trash2, Users } from 'lucide-angular';
import { Group, Member } from '../../../core/models/models';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';

/**
 * Reusable group card — receives all data via @Input() props and
 * emits user intent via @Output() events, per the assignment's
 * <GroupCard group={group} onDelete={} onEdit={} onClick={} /> spec.
 */
@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, AvatarComponent, BadgeComponent, InrCurrencyPipe, RelativeTimePipe],
  template: `
    <div class="group-card card-surface fade-in" (click)="cardClick.emit(group.id)">
      <div class="card-top">
        <app-badge [variant]="categoryVariant">{{ group.category }}</app-badge>
        <div class="menu-wrap">
          <button class="icon-btn" (click)="menuOpen = !menuOpen; $event.stopPropagation()" aria-label="Group options">
            <lucide-angular [img]="MoreIcon" [size]="17"></lucide-angular>
          </button>
          <div class="menu card-surface" *ngIf="menuOpen" (click)="$event.stopPropagation()">
            <button (click)="edit.emit(group.id); menuOpen = false">
              <lucide-angular [img]="EditIcon" [size]="14"></lucide-angular> Edit
            </button>
            <button class="danger" (click)="delete.emit(group.id); menuOpen = false">
              <lucide-angular [img]="TrashIcon" [size]="14"></lucide-angular> Delete
            </button>
          </div>
        </div>
      </div>

      <h3>{{ group.name }}</h3>

      <div class="members-row">
        <div class="avatar-stack">
          <app-avatar
            *ngFor="let m of members.slice(0, 4)"
            [name]="m.name"
            [color]="m.avatarColor"
            size="sm"
          ></app-avatar>
          <span class="more-count" *ngIf="members.length > 4">+{{ members.length - 4 }}</span>
        </div>
        <span class="member-count text-muted-app">
          <lucide-angular [img]="UsersIcon" [size]="13"></lucide-angular>
          {{ members.length }} members
        </span>
      </div>

      <div class="card-stats">
        <div>
          <span class="text-muted-app label">Total spent</span>
          <strong>{{ totalSpending | inrCurrency }}</strong>
        </div>
        <div>
          <span class="text-muted-app label">Your balance</span>
          <strong [ngClass]="myBalance >= 0 ? 'positive' : 'negative'">
            {{ (myBalance >= 0 ? '+' : '') + '' }}{{ myBalance | inrCurrency }}
          </strong>
        </div>
      </div>

      <div class="card-footer text-muted-app">Last activity: {{ group.lastActivity | relativeTime }}</div>
    </div>
  `,
  styles: [`
    .group-card {
      padding: 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .group-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .menu-wrap { position: relative; }
    .icon-btn {
      background: transparent;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
    }
    .icon-btn:hover { background: var(--color-surface-alt); }
    .menu {
      position: absolute;
      right: 0;
      top: 28px;
      min-width: 130px;
      box-shadow: var(--shadow-lg);
      z-index: 10;
      padding: 6px;
      display: flex;
      flex-direction: column;
    }
    .menu button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      text-align: left;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      color: var(--color-text);
    }
    .menu button:hover { background: var(--color-surface-alt); }
    .menu button.danger { color: var(--color-danger); }

    h3 { font-size: 17px; }

    .members-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .avatar-stack { display: flex; align-items: center; }
    .avatar-stack app-avatar { margin-right: -10px; }
    .more-count {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-surface-alt);
      border: 2px solid var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
    }
    .member-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .card-stats {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
    }
    .card-stats .label { display: block; font-size: 11px; margin-bottom: 2px; }
    .card-stats strong { font-size: 15px; }
    .positive { color: var(--color-success); }
    .negative { color: var(--color-danger); }

    .card-footer { font-size: 12px; }
  `],
})
export class GroupCardComponent {
  @Input({ required: true }) group!: Group;
  @Input() members: Member[] = [];
  @Input() totalSpending = 0;
  @Input() myBalance = 0;

  @Output() cardClick = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  menuOpen = false;

  readonly MoreIcon = MoreVertical;
  readonly EditIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly UsersIcon = Users;

  get categoryVariant(): 'primary' | 'success' | 'info' | 'warning' | 'neutral' {
    const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'neutral'> = {
      Trip: 'info',
      Home: 'success',
      Office: 'primary',
      Friends: 'warning',
      Family: 'neutral',
    };
    return map[this.group.category] ?? 'neutral';
  }
}
