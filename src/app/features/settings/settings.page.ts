import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Sun, Moon, Trash2, Download } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { currentMonthKey } from '../../core/services/mock-data';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    PageHeaderComponent,
    ButtonComponent,
    ProgressBarComponent,
    ConfirmDialogComponent,
    InrCurrencyPipe,
  ],
  template: `
    <div class="page-container narrow">
      <app-page-header title="Settings" subtitle="Preferences and budget management"></app-page-header>

      <div class="card-surface section">
        <h3>Appearance</h3>
        <div class="row">
          <div>
            <p class="row-title">Theme</p>
            <p class="text-muted-app row-desc">Switch between light and dark mode.</p>
          </div>
          <button class="theme-toggle" (click)="store.toggleTheme()">
            <lucide-angular [img]="store.theme() === 'light' ? SunIcon : MoonIcon" [size]="16"></lucide-angular>
            {{ store.theme() === 'light' ? 'Light' : 'Dark' }}
          </button>
        </div>
      </div>

      <div class="card-surface section">
        <h3>Monthly Budget</h3>
        <div class="row wrap">
          <div class="budget-input">
            <label for="mbudget">Set monthly budget (₹)</label>
            <input id="mbudget" type="number" min="0" [(ngModel)]="monthlyBudgetInput" placeholder="e.g. 40000" />
          </div>
          <app-button size="sm" (onClick)="saveMonthlyBudget()">Save</app-button>
        </div>
        <div class="budget-status" *ngIf="currentMonthlyBudget as budget">
          <div class="budget-row">
            <span>Spent this cycle</span>
            <strong>{{ store.totalExpenses() | inrCurrency }} / {{ budget | inrCurrency }}</strong>
          </div>
          <app-progress-bar [percent]="monthlyPct()"></app-progress-bar>
        </div>
      </div>

      <div class="card-surface section">
        <h3>Group Budgets</h3>
        <div class="group-budget-list">
          <div class="gb-row" *ngFor="let g of store.groups()">
            <div class="gb-top">
              <span>{{ g.name }}</span>
              <input
                type="number"
                min="0"
                class="mini-input"
                [ngModel]="g.budget || null"
                (ngModelChange)="updateGroupBudget(g.id, $event)"
                placeholder="No budget"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="card-surface section danger-zone">
        <h3>Danger Zone</h3>
        <div class="row">
          <div>
            <p class="row-title">Clear all data</p>
            <p class="text-muted-app row-desc">Clears all user-defined groups, members, expenses, and history.</p>
          </div>
          <app-button variant="danger" size="sm" (onClick)="resetOpen.set(true)">
            <lucide-angular [img]="TrashIcon" [size]="14"></lucide-angular>
            Clear Data
          </app-button>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      [open]="resetOpen()"
      title="Clear All Data"
      message="This will permanently delete all your user-defined groups, members, expenses, settlements, and history. This cannot be undone."
      confirmLabel="Clear Everything"
      (confirm)="doReset()"
      (cancel)="resetOpen.set(false)"
    ></app-confirm-dialog>
  `,
  styles: [`
    .narrow { max-width: 720px; }
    .section { padding: 22px; margin-bottom: 20px; }
    .section h3 { font-size: 16px; margin-bottom: 16px; }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .row.wrap { flex-wrap: wrap; align-items: flex-end; }
    .row-title { font-weight: 600; font-size: 14px; }
    .row-desc { font-size: 12.5px; margin-top: 2px; }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }

    .budget-input { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 180px; }
    .budget-input label { font-size: 12.5px; font-weight: 600; color: var(--color-text-muted); }
    .budget-input input, .mini-input {
      padding: 9px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text);
      font-size: 14px;
    }
    .budget-status { margin-top: 18px; display: flex; flex-direction: column; gap: 8px; }
    .budget-row { display: flex; justify-content: space-between; font-size: 13px; }

    .group-budget-list { display: flex; flex-direction: column; gap: 10px; }
    .gb-row { padding: 4px 0; }
    .gb-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .gb-top span { font-weight: 600; font-size: 13.5px; }
    .mini-input { width: 130px; }

    .danger-zone { border-color: var(--color-danger); }
  `],
})
export class SettingsPage {
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly TrashIcon = Trash2;
  readonly DownloadIcon = Download;

  resetOpen = signal(false);
  monthlyBudgetInput: number | null = null;

  get currentMonthlyBudget(): number | undefined {
    return this.store.budgets().find((b) => b.scope === 'monthly' && b.refId === currentMonthKey())?.amount;
  }

  constructor(public store: StoreService) {
    this.monthlyBudgetInput = this.currentMonthlyBudget ?? null;
  }

  monthlyPct(): number {
    const budget = this.currentMonthlyBudget;
    if (!budget) return 0;
    return (this.store.totalExpenses() / budget) * 100;
  }

  saveMonthlyBudget(): void {
    if (this.monthlyBudgetInput && this.monthlyBudgetInput > 0) {
      this.store.setBudget('monthly', currentMonthKey(), this.monthlyBudgetInput);
    }
  }

  updateGroupBudget(groupId: string, value: number): void {
    this.store.updateGroup(groupId, { budget: value > 0 ? value : undefined });
  }

  doReset(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    this.store.members.set([]);
    this.store.groups.set([]);
    this.store.expenses.set([]);
    this.store.settlements.set([]);
    this.store.notifications.set([]);
    this.store.budgets.set([]);
    this.store.currentUserId.set('');
    this.resetOpen.set(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}
