import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, Users, Wallet, TrendingUp, TrendingDown } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ExpenseCardComponent } from '../expenses/expense-card/expense-card.component';
import { ExpenseFormComponent, ExpenseFormValue } from '../expenses/expense-form/expense-form.component';
import { GroupFormComponent, GroupFormValue } from '../groups/group-form/group-form.component';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-group-details-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    ProgressBarComponent,
    ModalComponent,
    EmptyStateComponent,
    ExpenseCardComponent,
    ExpenseFormComponent,
    GroupFormComponent,
    InrCurrencyPipe,
  ],
  template: `
    <div class="page-container" *ngIf="group() as g">
      <button class="back-link" (click)="router.navigate(['/groups'])">
        <lucide-angular [img]="BackIcon" [size]="15"></lucide-angular>
        Back to Groups
      </button>

      <app-page-header [title]="g.name" [subtitle]="g.category + ' · ' + members().length + ' members'">
        <app-button variant="secondary" (onClick)="editOpen.set(true)">Edit Group</app-button>
        <app-button (onClick)="expenseFormOpen.set(true)">
          <lucide-angular [img]="PlusIcon" [size]="16"></lucide-angular>
          Add Expense
        </app-button>
      </app-page-header>

      <div class="top-grid">
        <div class="card-surface stat-block">
          <lucide-angular [img]="WalletIcon" [size]="18" class="stat-icon"></lucide-angular>
          <span class="text-muted-app">Total Spending</span>
          <strong>{{ totalSpending() | inrCurrency }}</strong>
        </div>
        <div class="card-surface stat-block">
          <lucide-angular [img]="UsersIcon" [size]="18" class="stat-icon"></lucide-angular>
          <span class="text-muted-app">Members</span>
          <strong>{{ members().length }}</strong>
        </div>
        <div class="card-surface stat-block" *ngIf="g.budget">
          <lucide-angular [img]="TrendingUpIcon" [size]="18" class="stat-icon"></lucide-angular>
          <span class="text-muted-app">Budget Used</span>
          <strong>{{ budgetPct() | number: '1.0-0' }}%</strong>
          <app-progress-bar [percent]="budgetPct()"></app-progress-bar>
        </div>
      </div>

      <div class="section">
        <h3>Members</h3>
        <div class="members-list">
          <div class="member-chip" *ngFor="let m of members()">
            <app-avatar [name]="m.name" [color]="m.avatarColor" size="sm"></app-avatar>
            <span>{{ m.name }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Balances</h3>
        <div class="balances-list">
          <div class="balance-row card-surface" *ngFor="let b of balances()">
            <div class="who">
              <app-avatar [name]="memberName(b.memberId)" [color]="memberColor(b.memberId)" size="sm"></app-avatar>
              <span>{{ memberName(b.memberId) }}</span>
            </div>
            <span [ngClass]="b.balance >= 0 ? 'positive' : 'negative'">
              <lucide-angular [img]="b.balance >= 0 ? TrendingUpIcon : TrendingDownIcon" [size]="14"></lucide-angular>
              {{ b.balance >= 0 ? 'Gets ' : 'Owes ' }}{{ absAmount(b.balance) | inrCurrency }}
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3>Expenses ({{ groupExpenses().length }})</h3>
        </div>
        <div class="list" *ngIf="groupExpenses().length > 0; else noExpenses">
          <app-expense-card
            *ngFor="let e of groupExpenses()"
            [expense]="e"
            [members]="members()"
            (edit)="openEditExpense(e)"
            (delete)="store.deleteExpense($event)"
          ></app-expense-card>
        </div>
        <ng-template #noExpenses>
          <app-empty-state title="No expenses yet" description="Add the first expense for this group.">
            <app-button (onClick)="expenseFormOpen.set(true)">Add Expense</app-button>
          </app-empty-state>
        </ng-template>
      </div>
    </div>

    <div class="page-container" *ngIf="!group()">
      <app-empty-state title="Group not found" description="This group may have been deleted.">
        <app-button (onClick)="router.navigate(['/groups'])">Back to Groups</app-button>
      </app-empty-state>
    </div>

    <app-modal [open]="expenseFormOpen()" [title]="editingExpense() ? 'Edit Expense' : 'Add Expense'" size="lg" (close)="closeExpenseForm()">
      <app-expense-form
        [groups]="group() ? [group()!] : []"
        [members]="store.members()"
        [defaultGroupId]="groupId"
        [initialExpense]="editingExpense()"
        (save)="handleExpenseSave($event)"
        (cancel)="closeExpenseForm()"
      ></app-expense-form>
    </app-modal>

    <app-modal [open]="editOpen()" title="Edit Group" (close)="editOpen.set(false)">
      <app-group-form
        [allMembers]="store.members()"
        [initialGroup]="group() || null"
        (save)="handleGroupSave($event)"
        (cancel)="editOpen.set(false)"
      ></app-group-form>
    </app-modal>
  `,
  styles: [`
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 12px;
      padding: 0;
    }
    .back-link:hover { color: var(--color-primary); }

    .top-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-block {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .stat-icon { color: var(--color-primary); }
    .stat-block strong { font-size: 22px; }

    .section { margin-bottom: 32px; }
    .section h3 { font-size: 16px; margin-bottom: 14px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .section-header h3 { margin-bottom: 0; }

    .members-list { display: flex; flex-wrap: wrap; gap: 10px; }
    .member-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 6px;
      border-radius: 999px;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      font-size: 13px;
      font-weight: 600;
    }

    .balances-list { display: flex; flex-direction: column; gap: 8px; }
    .balance-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
    }
    .who { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 14px; }
    .positive, .negative { display: flex; align-items: center; gap: 5px; font-weight: 700; font-size: 13.5px; }
    .positive { color: var(--color-success); }
    .negative { color: var(--color-danger); }

    .list { display: flex; flex-direction: column; gap: 12px; }
  `],
})
export class GroupDetailsPage {
  readonly BackIcon = ArrowLeft;
  readonly PlusIcon = Plus;
  readonly UsersIcon = Users;
  readonly WalletIcon = Wallet;
  readonly TrendingUpIcon = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;

  groupId = '';
  expenseFormOpen = signal(false);
  editingExpense = signal<Expense | null>(null);
  editOpen = signal(false);

  group = computed(() => this.store.groupById().get(this.groupId));
  members = computed(() => {
    const g = this.group();
    if (!g) return [];
    const map = this.store.memberById();
    return g.memberIds.map((id) => map.get(id)).filter((m): m is NonNullable<typeof m> => !!m);
  });
  groupExpenses = computed(() =>
    [...this.store.expenses()]
      .filter((e) => e.groupId === this.groupId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  totalSpending = computed(() => this.store.groupTotalSpending(this.groupId)());
  balances = computed(() => this.store.groupBalances(this.groupId)());
  budgetPct = computed(() => {
    const g = this.group();
    if (!g?.budget) return 0;
    return (this.totalSpending() / g.budget) * 100;
  });

  constructor(public store: StoreService, public router: Router, route: ActivatedRoute) {
    this.groupId = route.snapshot.paramMap.get('groupId') ?? '';
    route.paramMap.subscribe((params) => {
      this.groupId = params.get('groupId') ?? '';
    });
  }

  memberName(id: string): string {
    return this.store.memberById().get(id)?.name ?? 'Unknown';
  }
  memberColor(id: string): string {
    return this.store.memberById().get(id)?.avatarColor ?? '';
  }
  absAmount(n: number): number {
    return Math.abs(n);
  }

  openEditExpense(e: Expense): void {
    this.editingExpense.set(e);
    this.expenseFormOpen.set(true);
  }

  closeExpenseForm(): void {
    this.expenseFormOpen.set(false);
    this.editingExpense.set(null);
  }

  handleExpenseSave(value: ExpenseFormValue): void {
    const editing = this.editingExpense();
    if (editing) {
      this.store.updateExpense(editing.id, {
        title: value.title,
        amount: value.amount,
        paidBy: value.paidBy,
        splitType: value.splitType,
        date: value.date,
        category: value.category,
        notes: value.notes,
        ...({ participantIds: value.participantIds, rawValues: value.rawValues } as any),
      });
    } else {
      this.store.addExpense(value);
    }
    this.closeExpenseForm();
  }

  handleGroupSave(value: GroupFormValue): void {
    this.store.updateGroup(this.groupId, value);
    this.editOpen.set(false);
  }
}
