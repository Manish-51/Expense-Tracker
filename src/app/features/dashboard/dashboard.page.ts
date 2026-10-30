import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  HandCoins,
  Users,
  Plus,
} from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ExpenseCardComponent } from '../expenses/expense-card/expense-card.component';
import { SettlementCardComponent } from '../settlements/settlement-card/settlement-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { groupByCategory, groupByMonth } from '../../core/utils/expense-utils';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    StatCardComponent,
    ButtonComponent,
    ExpenseCardComponent,
    SettlementCardComponent,
    EmptyStateComponent,
    InrCurrencyPipe,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Dashboard" [subtitle]="store.currentUser() ? 'Welcome back, ' + store.currentUser()?.name + '!' : 'Track, split, and settle expenses easily'">
        <app-button (onClick)="router.navigate(['/expenses'], { queryParams: { new: 1 } })">
          <lucide-angular [img]="PlusIcon" [size]="16"></lucide-angular>
          Add Expense
        </app-button>
      </app-page-header>

      <div class="stats-grid">
        <app-stat-card title="Total Expenses" [value]="store.totalExpenses() | inrCurrency" [icon]="WalletIcon" tone="primary"></app-stat-card>
        <app-stat-card title="You Paid" [value]="stats().youPaid | inrCurrency" [icon]="ArrowUpIcon" tone="info"></app-stat-card>
        <app-stat-card title="You Owe" [value]="stats().youOwe | inrCurrency" [icon]="ArrowDownIcon" tone="danger"></app-stat-card>
        <app-stat-card title="You Are Owed" [value]="stats().youAreOwed | inrCurrency" [icon]="HandCoinsIcon" tone="success"></app-stat-card>
        <app-stat-card title="Active Groups" [value]="store.activeGroupsCount().toString()" [icon]="UsersIcon" tone="primary"></app-stat-card>
        <app-stat-card title="Pending Settlements" [value]="store.pendingSettlementsCount().toString()" [icon]="HandCoinsIcon" tone="warning"></app-stat-card>
      </div>

      <div class="chart-row">
        <div class="card-surface chart-card">
          <h3>Monthly Spending Overview</h3>
          <div class="bars" *ngIf="monthlyData().length > 0; else noChart1">
            <div class="bar-col" *ngFor="let m of monthlyData()">
              <div class="bar-track">
                <div class="bar-fill" [style.height.%]="barHeight(m.total)"></div>
              </div>
              <span class="bar-label text-muted-app">{{ m.month }}</span>
            </div>
          </div>
          <ng-template #noChart1><p class="text-muted-app empty-msg">No data yet.</p></ng-template>
        </div>

        <div class="card-surface chart-card">
          <h3>Spending by Category</h3>
          <div class="cat-list" *ngIf="categoryData().length > 0; else noChart2">
            <div class="cat-row" *ngFor="let c of categoryData()">
              <div class="cat-top">
                <span>{{ c.category }}</span>
                <strong>{{ c.amount | inrCurrency }}</strong>
              </div>
              <div class="cat-track">
                <div class="cat-fill" [style.width.%]="c.pct" [style.background]="c.color"></div>
              </div>
            </div>
          </div>
          <ng-template #noChart2><p class="text-muted-app empty-msg">No data yet.</p></ng-template>
        </div>
      </div>

      <div class="two-col">
        <div class="section">
          <div class="section-header">
            <h3>Recent Expenses</h3>
            <a (click)="router.navigate(['/expenses'])" class="link">View all</a>
          </div>
          <div class="list" *ngIf="recentExpenses().length > 0; else noExp">
            <app-expense-card
              *ngFor="let e of recentExpenses()"
              [expense]="e"
              [members]="store.members()"
              [showActions]="false"
            ></app-expense-card>
          </div>
          <ng-template #noExp>
            <app-empty-state title="No expenses yet" description="Add your first expense to get started."></app-empty-state>
          </ng-template>
        </div>

        <div class="section">
          <div class="section-header">
            <h3>Recent Settlements</h3>
            <a (click)="router.navigate(['/settlements'])" class="link">View all</a>
          </div>
          <div class="list" *ngIf="recentSettlements().length > 0; else noSettle">
            <app-settlement-card
              *ngFor="let s of recentSettlements()"
              [settlement]="s"
              [members]="store.members()"
              [groupName]="store.groupById().get(s.groupId)?.name || ''"
              (markPaid)="store.markSettlementPaid($event)"
            ></app-settlement-card>
          </div>
          <ng-template #noSettle>
            <app-empty-state title="All settled up" description="No pending settlements right now."></app-empty-state>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .chart-row {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }
    .chart-card { padding: 20px; }
    .chart-card h3 { font-size: 15px; margin-bottom: 18px; }
    .empty-msg { text-align: center; padding: 24px; font-size: 13px; }

    .bars { display: flex; align-items: flex-end; gap: 12px; height: 160px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
    .bar-track { width: 100%; max-width: 34px; height: 130px; display: flex; align-items: flex-end; background: var(--color-surface-alt); border-radius: 6px; overflow: hidden; }
    .bar-fill { width: 100%; background: var(--color-primary); border-radius: 6px 6px 0 0; transition: height 0.4s ease; min-height: 4px; }
    .bar-label { font-size: 10.5px; }

    .cat-list { display: flex; flex-direction: column; gap: 14px; }
    .cat-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
    .cat-track { height: 8px; background: var(--color-surface-alt); border-radius: 999px; overflow: hidden; }
    .cat-fill { height: 100%; border-radius: 999px; }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .section-header h3 { font-size: 16px; }
    .link { color: var(--color-primary); font-size: 13px; font-weight: 600; cursor: pointer; }
    .list { display: flex; flex-direction: column; gap: 10px; }

    @media (max-width: 992px) {
      .chart-row, .two-col { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardPage {
  readonly PlusIcon = Plus;
  readonly WalletIcon = Wallet;
  readonly ArrowUpIcon = ArrowUpRight;
  readonly ArrowDownIcon = ArrowDownRight;
  readonly HandCoinsIcon = HandCoins;
  readonly UsersIcon = Users;

  private readonly catColors: Record<string, string> = {
    Food: '#6366f1', Travel: '#ec4899', Hotel: '#14b8a6', Shopping: '#f59e0b',
    Entertainment: '#8b5cf6', Bills: '#ef4444', Other: '#06b6d4',
  };

  stats = computed(() => this.store.currentUserStats());

  recentExpenses = computed(() =>
    [...this.store.expenses()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  );
  recentSettlements = computed(() =>
    [...this.store.settlements()]
      .filter((s) => s.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  monthlyData = computed(() => groupByMonth(this.store.expenses()).slice(-6));
  maxMonthly = computed(() => Math.max(...this.monthlyData().map((m) => m.total), 1));

  categoryData = computed(() => {
    const grouped = groupByCategory(this.store.expenses());
    const total = Object.values(grouped).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        pct: (amount / total) * 100,
        color: this.catColors[category] ?? '#6366f1',
      }));
  });

  constructor(public store: StoreService, public router: Router) {}

  barHeight(value: number): number {
    return Math.max(4, (value / this.maxMonthly()) * 100);
  }
}
