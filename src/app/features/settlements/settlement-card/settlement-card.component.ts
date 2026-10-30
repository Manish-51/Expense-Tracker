import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowRight, Check } from 'lucide-angular';
import { Member, Settlement } from '../../../core/models/models';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-settlement-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AvatarComponent, BadgeComponent, InrCurrencyPipe, RelativeTimePipe, ButtonComponent],
  template: `
    <div class="settlement-card card-surface fade-in">
      <div class="parties">
        <div class="party">
          <app-avatar [name]="fromMember?.name || ''" [color]="fromMember?.avatarColor || ''" size="md"></app-avatar>
          <span>{{ fromMember?.name || 'Unknown' }}</span>
        </div>
        <div class="arrow">
          <lucide-angular [img]="ArrowIcon" [size]="16"></lucide-angular>
          <strong class="amount">{{ settlement.amount | inrCurrency }}</strong>
        </div>
        <div class="party">
          <app-avatar [name]="toMember?.name || ''" [color]="toMember?.avatarColor || ''" size="md"></app-avatar>
          <span>{{ toMember?.name || 'Unknown' }}</span>
        </div>
      </div>

      <div class="meta">
        <app-badge [variant]="settlement.status === 'paid' ? 'success' : 'warning'">
          {{ settlement.status === 'paid' ? 'Paid' : 'Pending' }}
        </app-badge>
        <span class="text-muted-app group-name" *ngIf="groupName">{{ groupName }}</span>
        <span class="text-muted-app time">
          {{ settlement.status === 'paid' ? 'Settled ' + (settlement.paidAt! | relativeTime) : 'Created ' + (settlement.createdAt | relativeTime) }}
        </span>
      </div>

      <app-button
        *ngIf="settlement.status === 'pending'"
        variant="outline"
        size="sm"
        (onClick)="markPaid.emit(settlement.id)"
      >
        <lucide-angular [img]="CheckIcon" [size]="14"></lucide-angular>
        Mark as Paid
      </app-button>
    </div>
  `,
  styles: [`
    .settlement-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .parties {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .party {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 600;
      text-align: center;
      max-width: 100px;
    }
    .party span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
    .arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--color-text-subtle);
      flex-shrink: 0;
    }
    .amount { font-size: 15px; color: var(--color-text); }

    .meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 12px;
    }
    .group-name { font-weight: 600; }
  `],
})
export class SettlementCardComponent {
  @Input({ required: true }) settlement!: Settlement;
  @Input() members: Member[] = [];
  @Input() groupName = '';
  @Output() markPaid = new EventEmitter<string>();

  readonly ArrowIcon = ArrowRight;
  readonly CheckIcon = Check;

  get fromMember(): Member | undefined {
    return this.members.find((m) => m.id === this.settlement.fromMemberId);
  }
  get toMember(): Member | undefined {
    return this.members.find((m) => m.id === this.settlement.toMemberId);
  }
}
