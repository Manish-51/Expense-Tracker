import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ArrowUpDown } from 'lucide-angular';
import { ExpenseCategory, Group, Member } from '../../../core/models/models';

export interface ExpenseFilterValue {
  query: string;
  category: ExpenseCategory | 'All';
  groupId: string | 'All';
  memberId: string | 'All';
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
}

@Component({
  selector: 'app-expense-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="filters card-surface">
      <div class="search-field">
        <lucide-angular [img]="SearchIcon" [size]="16"></lucide-angular>
        <input
          type="search"
          placeholder="Search by title, member, category..."
          [(ngModel)]="value.query"
          (ngModelChange)="emit()"
          aria-label="Search expenses"
        />
      </div>

      <select [(ngModel)]="value.groupId" (ngModelChange)="emit()" aria-label="Filter by group">
        <option value="All">All Groups</option>
        <option *ngFor="let g of groups" [value]="g.id">{{ g.name }}</option>
      </select>

      <select [(ngModel)]="value.category" (ngModelChange)="emit()" aria-label="Filter by category">
        <option value="All">All Categories</option>
        <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
      </select>

      <select [(ngModel)]="value.memberId" (ngModelChange)="emit()" aria-label="Filter by member">
        <option value="All">All Members</option>
        <option *ngFor="let m of members" [value]="m.id">{{ m.name }}</option>
      </select>

      <select [(ngModel)]="value.sortBy" (ngModelChange)="emit()" aria-label="Sort expenses">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="highest">Amount: High to Low</option>
        <option value="lowest">Amount: Low to High</option>
      </select>
    </div>
  `,
  styles: [`
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 14px;
      margin-bottom: 20px;
      align-items: center;
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 220px;
      padding: 9px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text-subtle);
    }
    .search-field input {
      border: none;
      background: transparent;
      outline: none;
      color: var(--color-text);
      width: 100%;
      font-size: 14px;
    }
    select {
      padding: 9px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text);
      font-size: 13px;
    }
  `],
})
export class ExpenseFiltersComponent implements OnInit {
  @Input() groups: Group[] = [];
  @Input() members: Member[] = [];
  @Input() initialQuery = '';
  @Output() filterChange = new EventEmitter<ExpenseFilterValue>();

  readonly categories: ExpenseCategory[] = ['Food', 'Travel', 'Hotel', 'Shopping', 'Entertainment', 'Bills', 'Other'];
  readonly SearchIcon = Search;
  readonly SortIcon = ArrowUpDown;

  value: ExpenseFilterValue = {
    query: '',
    category: 'All',
    groupId: 'All',
    memberId: 'All',
    sortBy: 'newest',
  };

  ngOnInit(): void {
    if (this.initialQuery) {
      this.value.query = this.initialQuery;
      this.emit();
    }
  }

  emit(): void {
    this.filterChange.emit({ ...this.value });
  }
}
