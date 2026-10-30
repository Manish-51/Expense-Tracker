import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, HandCoins } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { SettlementCardComponent } from './settlement-card/settlement-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-settlements-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PageHeaderComponent, SettlementCardComponent, EmptyStateComponent, InrCurrencyPipe],
  template: `
    <div class="page-container">
      <app-page-header title="Settlements" subtitle="See who owes whom and settle up"></app-page-header>

      <div class="tabs">
        <button [class.active]="tab() === 'pending'" (click)="tab.set('pending')">
          Pending ({{ pending().length }})
        </button>
        <button [class.active]="tab() === 'paid'" (click)="tab.set('paid')">
          Paid ({{ paid().length }})
        </button>
      </div>

      <div class="summary card-surface" *ngIf="tab() === 'pending' && pending().length > 0">
        Total pending across all groups: <strong>{{ totalPending() | inrCurrency }}</strong>
      </div>

      <div class="grid" *ngIf="visible().length > 0; else empty">
        <app-settlement-card
          *ngFor="let s of visible()"
          [settlement]="s"
          [members]="store.members()"
          [groupName]="store.groupById().get(s.groupId)?.name || ''"
          (markPaid)="store.markSettlementPaid($event)"
        ></app-settlement-card>
      </div>

      <ng-template #empty>
        <app-empty-state
          [icon]="HandCoinsIcon"
          [title]="tab() === 'pending' ? 'No pending settlements' : 'No settlements paid yet'"
          [description]="tab() === 'pending' ? 'All balances are settled up. Nice work!' : 'Settlements you mark as paid will appear here.'"
        ></app-empty-state>
      </ng-template>
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .tabs button {
      padding: 9px 18px;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text-muted);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .tabs button.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

    .summary {
      padding: 14px 18px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .summary strong { color: var(--color-danger); font-size: 16px; margin-left: 4px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
  `],
})
export class SettlementsPage {
  readonly HandCoinsIcon = HandCoins;
  tab = signal<'pending' | 'paid'>('pending');

  pending = computed(() =>
    [...this.store.settlements()]
      .filter((s) => s.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
  paid = computed(() =>
    [...this.store.settlements()]
      .filter((s) => s.status === 'paid')
      .sort((a, b) => new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime())
  );
  visible = computed(() => (this.tab() === 'pending' ? this.pending() : this.paid()));
  totalPending = computed(() => this.pending().reduce((sum, s) => sum + s.amount, 0));

  constructor(public store: StoreService) {}
}
