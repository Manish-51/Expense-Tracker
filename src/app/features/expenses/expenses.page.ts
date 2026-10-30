import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Plus, Receipt } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { ExpenseCardComponent } from './expense-card/expense-card.component';
import { ExpenseFiltersComponent, ExpenseFilterValue } from './expense-filters/expense-filters.component';
import { ExpenseFormComponent, ExpenseFormValue } from './expense-form/expense-form.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Expense } from '../../core/models/models';

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    ExpenseCardComponent,
    ExpenseFiltersComponent,
    ExpenseFormComponent,
    ButtonComponent,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Expense History" subtitle="All your shared expenses in one place">
        <app-button (onClick)="openCreate()">
          <lucide-angular [img]="PlusIcon" [size]="16"></lucide-angular>
          Add Expense
        </app-button>
      </app-page-header>

      <app-expense-filters
        [groups]="store.groups()"
        [members]="store.members()"
        [initialQuery]="initialQuery"
        (filterChange)="filters.set($event)"
      ></app-expense-filters>

      <div class="list" *ngIf="filteredExpenses().length > 0; else empty">
        <app-expense-card
          *ngFor="let e of filteredExpenses()"
          [expense]="e"
          [members]="store.members()"
          (edit)="openEdit(e)"
          (delete)="confirmDelete(e)"
        ></app-expense-card>
      </div>

      <ng-template #empty>
        <app-empty-state
          [icon]="ReceiptIcon"
          title="No expenses found"
          description="Try adjusting your filters, or add a new expense to get started."
        >
          <app-button (onClick)="openCreate()">Add Expense</app-button>
        </app-empty-state>
      </ng-template>
    </div>

    <app-modal [open]="formOpen()" [title]="editingExpense() ? 'Edit Expense' : 'Add Expense'" size="lg" (close)="formOpen.set(false)">
      <app-expense-form
        [groups]="store.groups()"
        [members]="store.members()"
        [initialExpense]="editingExpense()"
        (save)="handleSave($event)"
        (cancel)="formOpen.set(false)"
      ></app-expense-form>
    </app-modal>

    <app-confirm-dialog
      [open]="deleteTarget() !== null"
      title="Delete Expense"
      [message]="'Delete \\'' + (deleteTarget()?.title || '') + '\\'? Balances will be recalculated. This cannot be undone.'"
      (confirm)="doDelete()"
      (cancel)="deleteTarget.set(null)"
    ></app-confirm-dialog>
  `,
  styles: [`
    .list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `],
})
export class ExpensesPage {
  readonly PlusIcon = Plus;
  readonly ReceiptIcon = Receipt;

  formOpen = signal(false);
  editingExpense = signal<Expense | null>(null);
  deleteTarget = signal<Expense | null>(null);
  filters = signal<ExpenseFilterValue>({ query: '', category: 'All', groupId: 'All', memberId: 'All', sortBy: 'newest' });
  initialQuery = '';

  filteredExpenses = computed(() => {
    const f = this.filters();
    const memberMap = this.store.memberById();
    const groupMap = this.store.groupById();
    let list = this.store.expenses().filter((e) => {
      const matchesQuery =
        !f.query ||
        e.title.toLowerCase().includes(f.query.toLowerCase()) ||
        e.category.toLowerCase().includes(f.query.toLowerCase()) ||
        memberMap.get(e.paidBy)?.name.toLowerCase().includes(f.query.toLowerCase()) ||
        groupMap.get(e.groupId)?.name.toLowerCase().includes(f.query.toLowerCase());
      const matchesCategory = f.category === 'All' || e.category === f.category;
      const matchesGroup = f.groupId === 'All' || e.groupId === f.groupId;
      const matchesMember =
        f.memberId === 'All' || e.paidBy === f.memberId || e.participants.some((p) => p.memberId === f.memberId);
      return matchesQuery && matchesCategory && matchesGroup && matchesMember;
    });

    switch (f.sortBy) {
      case 'newest':
        list = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        list = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        list = [...list].sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        list = [...list].sort((a, b) => a.amount - b.amount);
        break;
    }
    return list;
  });

  constructor(public store: StoreService, route: ActivatedRoute) {
    route.queryParamMap.subscribe((params) => {
      const q = params.get('q');
      if (q) this.initialQuery = q;
      if (params.get('new') === '1') this.openCreate();
    });
  }

  openCreate(): void {
    this.editingExpense.set(null);
    this.formOpen.set(true);
  }

  openEdit(e: Expense): void {
    this.editingExpense.set(e);
    this.formOpen.set(true);
  }

  handleSave(value: ExpenseFormValue): void {
    const editing = this.editingExpense();
    if (editing) {
      this.store.updateExpense(editing.id, {
        title: value.title,
        amount: value.amount,
        paidBy: value.paidBy,
        groupId: value.groupId,
        splitType: value.splitType,
        date: value.date,
        category: value.category,
        notes: value.notes,
        ...({ participantIds: value.participantIds, rawValues: value.rawValues } as any),
      });
    } else {
      this.store.addExpense(value);
    }
    this.formOpen.set(false);
  }

  confirmDelete(e: Expense): void {
    this.deleteTarget.set(e);
  }

  doDelete(): void {
    const target = this.deleteTarget();
    if (target) this.store.deleteExpense(target.id);
    this.deleteTarget.set(null);
  }
}
