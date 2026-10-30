import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, Mail } from 'lucide-angular';
import { Member } from '../../../core/models/models';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

export interface MemberStats {
  paid: number;
  owed: number;
  received: number;
  balance: number;
}

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AvatarComponent, InrCurrencyPipe],
  template: `
    <div class="member-card card-surface fade-in">
      <div class="top">
        <app-avatar [name]="member.name" [color]="member.avatarColor" size="lg"></app-avatar>
        <div class="actions">
          <button class="icon-btn" (click)="edit.emit(member.id)" aria-label="Edit member">
            <lucide-angular [img]="EditIcon" [size]="15"></lucide-angular>
          </button>
          <button class="icon-btn danger" (click)="delete.emit(member.id)" aria-label="Remove member">
            <lucide-angular [img]="TrashIcon" [size]="15"></lucide-angular>
          </button>
        </div>
      </div>

      <h4>{{ member.name }}</h4>
      <p class="email text-muted-app">
        <lucide-angular [img]="MailIcon" [size]="13"></lucide-angular>
        {{ member.email }}
      </p>

      <div class="stats-grid">
        <div>
          <span class="text-muted-app label">Total Paid</span>
          <strong>{{ stats.paid | inrCurrency }}</strong>
        </div>
        <div>
          <span class="text-muted-app label">Total Owed</span>
          <strong>{{ stats.owed | inrCurrency }}</strong>
        </div>
        <div>
          <span class="text-muted-app label">Received</span>
          <strong>{{ stats.received | inrCurrency }}</strong>
        </div>
        <div>
          <span class="text-muted-app label">Balance</span>
          <strong [ngClass]="stats.balance >= 0 ? 'positive' : 'negative'">{{ stats.balance | inrCurrency }}</strong>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .top { display: flex; align-items: flex-start; justify-content: space-between; }
    .actions { display: flex; gap: 4px; }
    .icon-btn {
      background: transparent; border: none; color: var(--color-text-muted);
      cursor: pointer; padding: 6px; border-radius: 8px; display: flex;
    }
    .icon-btn:hover { background: var(--color-surface-alt); }
    .icon-btn.danger:hover { background: var(--color-danger-light); color: var(--color-danger); }
    h4 { font-size: 16px; }
    .email { display: flex; align-items: center; gap: 5px; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
    }
    .label { display: block; font-size: 11px; margin-bottom: 2px; }
    strong { font-size: 14px; }
    .positive { color: var(--color-success); }
    .negative { color: var(--color-danger); }
  `],
})
export class MemberCardComponent {
  @Input({ required: true }) member!: Member;
  @Input() stats: MemberStats = { paid: 0, owed: 0, received: 0, balance: 0 };
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  readonly EditIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly MailIcon = Mail;
}
