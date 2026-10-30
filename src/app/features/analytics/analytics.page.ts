import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, Award, ArrowUpCircle, Divide } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { averageBy, groupByCategory, groupByMonth, sumBy } from '../../core/utils/expense-utils';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PageHeaderComponent, StatCardComponent, InrCurrencyPipe],
  template: `
    <div class="page-container">
      <app-page-header title="Analytics" subtitle="Deep dive into your group spending"></app-page-header>

      <div class="stats-grid">
        <app-stat-card title="Total Spending" [value]="totalSpending() | inrCurrency" [icon]="TrendingUpIcon" tone="primary"></app-stat-card>
        <app-stat-card title="Average Expense" [value]="avgExpense() | inrCurrency" [icon]="DivideIcon" tone="info"></app-stat-card>
        <app-stat-card title="Highest Expense" [value]="(highestExpense()?.amount ?? 0) | inrCurrency" [icon]="ArrowUpCircleIcon" tone="danger"></app-stat-card>
        <app-stat-card title="Top Category" [value]="topCategory()?.category ?? 'N/A'" [icon]="AwardIcon" tone="warning"></app-stat-card>
      </div>

      <div class="chart-row">
        <div class="card-surface chart-card">
          <h3>Monthly Spending</h3>
          <div class="bars" *ngIf="monthlyData().length > 0; else noMonthly">
            <div class="bar-col" *ngFor="let m of monthlyData()">
              <div class="bar-track">
                <div class="bar-fill" [style.height.%]="barHeight(m.total)"></div>
              </div>
              <span class="bar-label text-muted-app">{{ m.month }}</span>
            </div>
          </div>
          <ng-template #noMonthly><p class="text-muted-app empty-msg">No monthly spending data yet.</p></ng-template>
        </div>

        <div class="card-surface chart-card">
          <h3>Category Breakdown</h3>
          <div class="donut-wrap" *ngIf="categoryData().length > 0 && store.totalExpenses() > 0; else noCategory">
            <svg viewBox="0 0 42 42" class="donut">
              <circle
                *ngFor="let seg of donutSegments()"
                cx="21" cy="21" r="15.9"
                fill="transparent"
                [attr.stroke]="seg.color"
                stroke-width="6"
                [attr.stroke-dasharray]="seg.dash + ' ' + (100 - seg.dash)"
                [attr.stroke-dashoffset]="seg.offset"
              />
            </svg>
            <div class="donut-legend">
              <div class="legend-item" *ngFor="let c of categoryData()">
                <span class="swatch" [style.background]="c.color"></span>
                {{ c.category }} — {{ c.pct | number: '1.0-0' }}%
              </div>
            </div>
          </div>
          <ng-template #noCategory><p class="text-muted-app empty-msg">No category data yet.</p></ng-template>
        </div>
      </div>

      <div class="chart-row single">
        <div class="card-surface chart-card">
          <h3>Spending by Group</h3>
          <div class="cat-list" *ngIf="groupData().length > 0 && store.totalExpenses() > 0; else noGroup">
            <div class="cat-row" *ngFor="let g of groupData()">
              <div class="cat-top">
                <span>{{ g.name }}</span>
                <strong>{{ g.total | inrCurrency }}</strong>
              </div>
              <div class="cat-track">
                <div class="cat-fill" [style.width.%]="g.pct"></div>
              </div>
            </div>
          </div>
          <ng-template #noGroup><p class="text-muted-app empty-msg">No group spending data yet.</p></ng-template>
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
      margin-bottom: 20px;
    }
    .chart-row.single { grid-template-columns: 1fr; }
    .chart-card { padding: 20px; }
    .chart-card h3 { font-size: 15px; margin-bottom: 18px; }

    .bars { display: flex; align-items: flex-end; gap: 12px; height: 200px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
    .bar-track { width: 100%; max-width: 38px; height: 170px; display: flex; align-items: flex-end; background: var(--color-surface-alt); border-radius: 6px; overflow: hidden; }
    .bar-fill { width: 100%; background: var(--color-primary); border-radius: 6px 6px 0 0; transition: height 0.4s ease; min-height: 4px; }
    .bar-label { font-size: 10.5px; }

    .donut-wrap { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; justify-content: center; }
    .donut { width: 150px; height: 150px; transform: rotate(-90deg); }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
    .swatch { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

    .cat-list { display: flex; flex-direction: column; gap: 14px; }
    .cat-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
    .cat-track { height: 8px; background: var(--color-surface-alt); border-radius: 999px; overflow: hidden; }
    .cat-fill { height: 100%; border-radius: 999px; background: var(--color-primary); }

    @media (max-width: 992px) {
      .chart-row { grid-template-columns: 1fr; }
    }
  `],
})
export class AnalyticsPage {
  readonly TrendingUpIcon = TrendingUp;
  readonly AwardIcon = Award;
  readonly ArrowUpCircleIcon = ArrowUpCircle;
  readonly DivideIcon = Divide;

  private readonly catColors: Record<string, string> = {
    Food: '#6366f1', Travel: '#ec4899', Hotel: '#14b8a6', Shopping: '#f59e0b',
    Entertainment: '#8b5cf6', Bills: '#ef4444', Other: '#06b6d4',
  };

  totalSpending = computed(() => sumBy(this.store.expenses(), (e) => e.amount));
  avgExpense = computed(() => averageBy(this.store.expenses(), (e) => e.amount));
  highestExpense = computed<Expense | undefined>(() =>
    [...this.store.expenses()].sort((a, b) => b.amount - a.amount)[0]
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

  topCategory = computed<{ category: string; amount: number; pct: number; color: string } | undefined>(
    () => this.categoryData()[0]
  );

  groupData = computed(() => {
    const groups = this.store.groups();
    const expenses = this.store.expenses();
    const totals = groups.map((g) => ({
      name: g.name,
      total: sumBy(expenses.filter((e) => e.groupId === g.id), (e) => e.amount),
    }));
    const max = Math.max(...totals.map((t) => t.total), 1);
    return totals
      .sort((a, b) => b.total - a.total)
      .map((t) => ({ ...t, pct: (t.total / max) * 100 }));
  });

  constructor(public store: StoreService) {}

  barHeight(value: number): number {
    return Math.max(4, (value / this.maxMonthly()) * 100);
  }

  donutSegments() {
    let cumulative = 0;
    return this.categoryData().map((c) => {
      const dash = c.pct;
      const offset = 25 - cumulative;
      cumulative += dash;
      return { color: c.color, dash, offset };
    });
  }
}
