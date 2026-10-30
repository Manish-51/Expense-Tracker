import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Expense, ExpenseCategory, Group, Member, SplitType } from '../../../core/models/models';
import { resolveShares, validateShares } from '../../../core/utils/expense-utils';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { StoreService } from '../../../core/services/store.service';

export interface ExpenseFormValue {
  title: string;
  amount: number;
  paidBy: string;
  groupId: string;
  participantIds: string[];
  splitType: SplitType;
  rawValues?: Record<string, number>;
  date: string;
  category: ExpenseCategory;
  notes?: string;
}

const CATEGORIES: ExpenseCategory[] = ['Food', 'Travel', 'Hotel', 'Shopping', 'Entertainment', 'Bills', 'Other'];

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, AvatarComponent, InrCurrencyPipe],
  template: `
    <form (ngSubmit)="onSubmit()" novalidate>
      <div class="row-2">
        <div class="field">
          <label for="etitle">Expense Title <span class="req">*</span></label>
          <input id="etitle" type="text" [(ngModel)]="title" name="title" placeholder="e.g. Dinner, Groceries" required maxlength="60" />
        </div>
        <div class="field">
          <label for="eamount">Amount (₹) <span class="req">*</span></label>
          <input id="eamount" type="number" min="0.01" step="0.01" [(ngModel)]="amount" name="amount" placeholder="0.00" required />
        </div>
      </div>

      <div class="row-2">
        <div class="field">
          <div class="field-header">
            <label for="egroup">Group <span class="req">*</span></label>
            <button type="button" class="quick-btn" (click)="showAddGroup = !showAddGroup">
              {{ showAddGroup ? 'Cancel' : '+ New Group' }}
            </button>
          </div>

          <div class="quick-box" *ngIf="showAddGroup">
            <input
              type="text"
              [(ngModel)]="newGroupName"
              name="newGroupName"
              placeholder="Enter new group name"
              (keydown.enter)="$event.preventDefault(); addQuickGroup()"
            />
            <button type="button" class="add-mini-btn" (click)="addQuickGroup()" [disabled]="!newGroupName.trim()">
              Create
            </button>
          </div>

          <select id="egroup" [(ngModel)]="groupId" name="groupId" (ngModelChange)="onGroupChange()" required>
            <option value="" disabled>Select a group</option>
            <option *ngFor="let g of groups" [value]="g.id">{{ g.name }}</option>
          </select>
          <span class="err" *ngIf="groups.length === 0">No groups found. Click <strong>+ New Group</strong> to create one.</span>
        </div>

        <div class="field">
          <label for="ecat">Category</label>
          <select id="ecat" [(ngModel)]="category" name="category">
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <div class="row-2">
        <div class="field">
          <div class="field-header">
            <label for="epaidby">Paid By <span class="req">*</span></label>
            <button type="button" class="quick-btn" (click)="showAddMember = !showAddMember">
              {{ showAddMember ? 'Cancel' : '+ New Member' }}
            </button>
          </div>

          <div class="quick-box" *ngIf="showAddMember">
            <input
              type="text"
              [(ngModel)]="newMemberName"
              name="newMemberName"
              placeholder="Enter member name"
              (keydown.enter)="$event.preventDefault(); addQuickMember()"
            />
            <button type="button" class="add-mini-btn" (click)="addQuickMember()" [disabled]="!newMemberName.trim()">
              Add
            </button>
          </div>

          <select id="epaidby" [(ngModel)]="paidBy" name="paidBy" required>
            <option value="" disabled>Select member</option>
            <option *ngFor="let m of groupMembers" [value]="m.id">{{ m.name }}</option>
          </select>
          <span class="err" *ngIf="groupMembers.length === 0 && groupId">No members in this group. Click <strong>+ New Member</strong> above.</span>
        </div>

        <div class="field">
          <label for="edate">Date</label>
          <input id="edate" type="date" [(ngModel)]="date" name="date" [max]="today" />
        </div>
      </div>

      <div class="field" *ngIf="groupId">
        <label>Split Method</label>
        <div class="split-tabs">
          <button type="button" *ngFor="let s of splitTypes" [class.active]="splitType === s.value" (click)="splitType = s.value">
            {{ s.label }}
          </button>
        </div>
      </div>

      <div class="field" *ngIf="groupId">
        <label>Participants <span class="req">*</span></label>
        <div class="participants" *ngIf="groupMembers.length > 0; else noParticipants">
          <div class="participant-row" *ngFor="let m of groupMembers">
            <label class="check-label">
              <input type="checkbox" [checked]="participantIds.has(m.id)" (change)="toggleParticipant(m.id)" />
              <app-avatar [name]="m.name" [color]="m.avatarColor" size="sm"></app-avatar>
              <span>{{ m.name }}</span>
            </label>

            <ng-container *ngIf="participantIds.has(m.id)">
              <span class="equal-share text-muted-app" *ngIf="splitType === 'equal'">
                {{ equalShareFor(m.id) | inrCurrency }}
              </span>
              <input
                *ngIf="splitType === 'unequal' || splitType === 'exact'"
                type="number"
                class="mini-input"
                min="0"
                step="0.01"
                [ngModel]="rawValues[m.id] || null"
                (ngModelChange)="setRawValue(m.id, $event)"
                name="raw-{{ m.id }}"
                placeholder="₹0"
              />
              <div class="pct-input-wrap" *ngIf="splitType === 'percentage'">
                <input
                  type="number"
                  class="mini-input"
                  min="0"
                  max="100"
                  step="0.1"
                  [ngModel]="rawValues[m.id] || null"
                  (ngModelChange)="setRawValue(m.id, $event)"
                  name="raw-{{ m.id }}"
                  placeholder="0"
                />
                <span>%</span>
              </div>
            </ng-container>
          </div>
        </div>

        <ng-template #noParticipants>
          <p class="empty-hint text-muted-app">No members in this group yet. Use <strong>+ New Member</strong> above to add participants.</p>
        </ng-template>

        <div class="split-summary" *ngIf="splitType !== 'equal' && participantIds.size > 0">
          <span [ngClass]="isValidSplit ? 'ok' : 'err'">
            {{ splitType === 'percentage' ? totalRaw + '% allocated' : (totalRaw | inrCurrency) + ' allocated of ' + (amount | inrCurrency) }}
          </span>
        </div>
        <span class="err" *ngIf="submitted && participantIds.size === 0">Select at least one participant.</span>
      </div>

      <div class="field">
        <label for="enotes">Notes (optional)</label>
        <textarea id="enotes" [(ngModel)]="notes" name="notes" rows="2" maxlength="200" placeholder="Add a note..."></textarea>
      </div>

      <div class="actions">
        <app-button variant="secondary" type="button" (onClick)="cancel.emit()">Cancel</app-button>
        <app-button variant="primary" type="submit" [disabled]="!canSubmit">
          {{ initialExpense ? 'Save Changes' : 'Add Expense' }}
        </app-button>
      </div>
    </form>
  `,
  styles: [`
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
    .field-header { display: flex; justify-content: space-between; align-items: center; }
    label { font-size: 13px; font-weight: 600; color: var(--color-text-muted); }
    .req { color: var(--color-danger); }

    .quick-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    .quick-btn:hover { text-decoration: underline; }

    .quick-box {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
      padding: 6px;
      background: var(--color-surface-alt);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-sm);
    }
    .quick-box input {
      flex: 1;
      padding: 6px 10px;
      font-size: 13px;
    }
    .add-mini-btn {
      padding: 6px 14px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .add-mini-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty-hint {
      font-size: 13px;
      padding: 10px;
      background: var(--color-surface-alt);
      border-radius: var(--radius-sm);
      border: 1px dashed var(--color-border);
    }

    input, select, textarea {
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text);
      font-size: 14px;
      width: 100%;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--color-primary); }
    textarea { resize: vertical; }
    .err { color: var(--color-danger); font-size: 12px; }
    .ok { color: var(--color-success); font-size: 12px; font-weight: 600; }

    .split-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .split-tabs button {
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text-muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .split-tabs button.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

    .participants {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
      padding: 4px;
    }
    .participant-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }
    .check-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }
    .check-label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .equal-share { font-size: 13px; font-weight: 600; }
    .mini-input { width: 90px; padding: 6px 8px; font-size: 13px; }
    .pct-input-wrap { display: flex; align-items: center; gap: 4px; }
    .pct-input-wrap .mini-input { width: 64px; }

    .split-summary { margin-top: 8px; font-size: 12px; }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
      border-top: 1px solid var(--color-border);
      padding-top: 16px;
    }

    @media (max-width: 576px) {
      .row-2 { grid-template-columns: 1fr; }
    }
  `],
})
export class ExpenseFormComponent implements OnChanges {
  @Input() groups: Group[] = [];
  @Input() members: Member[] = [];
  @Input() initialExpense: Expense | null = null;
  @Input() defaultGroupId: string | null = null;
  @Output() save = new EventEmitter<ExpenseFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly categories = CATEGORIES;
  readonly splitTypes: { value: SplitType; label: string }[] = [
    { value: 'equal', label: 'Equal' },
    { value: 'unequal', label: 'Unequal' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'exact', label: 'Exact' },
  ];
  readonly today = new Date().toISOString().slice(0, 10);

  title = '';
  amount: number | null = null;
  groupId = '';
  paidBy = '';
  category: ExpenseCategory = 'Food';
  date = this.today;
  notes = '';
  splitType: SplitType = 'equal';
  participantIds = new Set<string>();
  rawValues: Record<string, number> = {};
  submitted = false;

  showAddGroup = false;
  newGroupName = '';

  showAddMember = false;
  newMemberName = '';

  constructor(private store: StoreService) {}

  ngOnChanges(): void {
    if (this.initialExpense) {
      const e = this.initialExpense;
      this.title = e.title;
      this.amount = e.amount;
      this.groupId = e.groupId;
      this.paidBy = e.paidBy;
      this.category = e.category;
      this.date = e.date.slice(0, 10);
      this.notes = e.notes ?? '';
      this.splitType = e.splitType;
      this.participantIds = new Set(e.participants.map((p) => p.memberId));
      this.rawValues = {};
      e.participants.forEach((p) => {
        if (p.value !== undefined) this.rawValues[p.memberId] = p.value;
      });
    } else {
      this.title = '';
      this.amount = null;
      this.groupId = this.defaultGroupId ?? (this.groups.length > 0 ? this.groups[0].id : '');
      this.paidBy = '';
      this.category = 'Food';
      this.date = this.today;
      this.notes = '';
      this.splitType = 'equal';
      this.rawValues = {};
      this.onGroupChange();
    }
    this.submitted = false;
    this.showAddGroup = false;
    this.newGroupName = '';
    this.showAddMember = false;
    this.newMemberName = '';
  }

  get groupMembers(): Member[] {
    const group = this.groups.find((g) => g.id === this.groupId);
    if (!group) {
      return this.members;
    }
    const set = new Set(group.memberIds);
    const membersInGroup = this.members.filter((m) => set.has(m.id));
    // If group has no members yet, fallback to all members so user can select
    return membersInGroup.length > 0 ? membersInGroup : this.members;
  }

  onGroupChange(): void {
    this.participantIds = new Set(this.groupMembers.map((m) => m.id));
    this.paidBy = this.groupMembers[0]?.id ?? '';
    this.rawValues = {};
  }

  toggleParticipant(id: string): void {
    if (this.participantIds.has(id)) this.participantIds.delete(id);
    else this.participantIds.add(id);
  }

  setRawValue(id: string, value: number): void {
    this.rawValues = { ...this.rawValues, [id]: value || 0 };
  }

  equalShareFor(_id: string): number {
    if (!this.amount || this.participantIds.size === 0) return 0;
    return Math.round((this.amount / this.participantIds.size) * 100) / 100;
  }

  get totalRaw(): number {
    return Array.from(this.participantIds).reduce((sum, id) => sum + (this.rawValues[id] || 0), 0);
  }

  get isValidSplit(): boolean {
    if (this.splitType === 'equal') return true;
    if (this.splitType === 'percentage') return Math.abs(this.totalRaw - 100) < 0.5;
    if (!this.amount) return false;
    return Math.abs(this.totalRaw - this.amount) < 0.5;
  }

  get canSubmit(): boolean {
    return (
      !!this.title.trim() &&
      !!this.amount &&
      this.amount > 0 &&
      !!this.groupId &&
      !!this.paidBy &&
      this.participantIds.size > 0 &&
      this.isValidSplit
    );
  }

  addQuickGroup(): void {
    const trimmed = this.newGroupName.trim();
    if (!trimmed) return;
    const memberIds = Array.from(this.participantIds.size > 0 ? this.participantIds : (this.paidBy ? [this.paidBy] : []));
    const created = this.store.addGroup(trimmed, 'Other', memberIds);
    this.groupId = created.id;
    this.newGroupName = '';
    this.showAddGroup = false;
    this.onGroupChange();
  }

  addQuickMember(): void {
    const trimmed = this.newMemberName.trim();
    if (!trimmed) return;
    const created = this.store.addMember(trimmed, `${trimmed.toLowerCase().replace(/\s+/g, '.')}@example.com`);
    if (this.groupId) {
      this.store.addMemberToGroup(this.groupId, created.id);
    }
    this.participantIds.add(created.id);
    if (!this.paidBy) {
      this.paidBy = created.id;
    }
    this.newMemberName = '';
    this.showAddMember = false;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.canSubmit || !this.amount) return;

    const participantIds = Array.from(this.participantIds);
    const shares = resolveShares(this.amount, participantIds, this.splitType, this.rawValues);
    if (!validateShares(this.amount, shares) && this.splitType !== 'percentage') {
      if (this.splitType !== 'equal') return;
    }

    // Ensure all participants and payer are attached to group
    if (this.groupId) {
      for (const pid of [...participantIds, this.paidBy]) {
        this.store.addMemberToGroup(this.groupId, pid);
      }
    }

    this.save.emit({
      title: this.title.trim(),
      amount: this.amount,
      paidBy: this.paidBy,
      groupId: this.groupId,
      participantIds,
      splitType: this.splitType,
      rawValues: this.splitType === 'equal' ? undefined : this.rawValues,
      date: new Date(this.date).toISOString(),
      category: this.category,
      notes: this.notes.trim() || undefined,
    });
  }
}
