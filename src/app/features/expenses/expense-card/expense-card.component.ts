import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Utensils,
  Plane,
  Hotel,
  ShoppingBag,
  Clapperboard,
  Receipt,
  Package,
  Trash2,
  Pencil,
} from 'lucide-angular';
import { Expense, Member } from '../../../core/models/models';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

const CATEGORY_ICONS: Record<string, any> = {
  Food: Utensils,
  Travel: Plane,
  Hotel: Hotel,
  Shopping: ShoppingBag,
  Entertainment: Clapperboard,
  Bills: Receipt,
  Other: Package,
};

/**
 * Reusable expense card.
 * <app-expense-card [expense]="expense" [members]="members" (delete)="onDelete($event)" />
 */
@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AvatarComponent, InrCurrencyPipe],
  template: `
    <div class="expense-card card-surface fade-in">
      <div class="cat-icon">
        <lucide-angular [img]="categoryIcon" [size]="19"></lucide-angular>
      </div>

      <div class="details">
        <div class="row-top">
          <h4>{{ expense.title }}</h4>
          <strong class="amount">{{ expense.amount | inrCurrency }}</strong>
        </div>
        <div class="row-meta text-muted-app">
          <app-avatar [name]="payer?.name || ''" [color]="payer?.avatarColor || ''" size="sm"></app-avatar>
          <span>Paid by {{ payer?.name || 'Unknown' }}</span>
          <span class="sep">·</span>
          <span>{{ expense.date | date: 'dd MMM yyyy' }}</span>
          <span class="sep">·</span>
          <span>{{ expense.category }}</span>
        </div>
        <p class="notes text-muted-app" *ngIf="expense.notes">{{ expense.notes }}</p>
      </div>

      <div class="actions" *ngIf="showActions">
        <button class="icon-btn" (click)="edit.emit(expense.id)" aria-label="Edit expense">
          <lucide-angular [img]="EditIcon" [size]="16"></lucide-angular>
        </button>
        <button class="icon-btn danger" (click)="delete.emit(expense.id)" aria-label="Delete expense">
          <lucide-angular [img]="TrashIcon" [size]="16"></lucide-angular>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .expense-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
    }
    .cat-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .details { flex: 1; min-width: 0; }
    .row-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    h4 { font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .amount { font-size: 15px; white-space: nowrap; }
    .row-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      margin-top: 6px;
      flex-wrap: wrap;
    }
    .sep { opacity: 0.5; }
    .notes {
      font-size: 12.5px;
      margin-top: 6px;
      font-style: italic;
    }
    .actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
    .icon-btn {
      background: transparent;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
    }
    .icon-btn:hover { background: var(--color-surface-alt); }
    .icon-btn.danger:hover { background: var(--color-danger-light); color: var(--color-danger); }

    @media (max-width: 576px) {
      .row-top { flex-direction: column; align-items: flex-start; gap: 2px; }
    }
  `],
})
export class ExpenseCardComponent {
  @Input({ required: true }) expense!: Expense;
  @Input() members: Member[] = [];
  @Input() showActions = true;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  readonly EditIcon = Pencil;
  readonly TrashIcon = Trash2;

  get payer(): Member | undefined {
    return this.members.find((m) => m.id === this.expense.paidBy);
  }

  get categoryIcon(): any {
    return CATEGORY_ICONS[this.expense.category] ?? Package;
  }
}
