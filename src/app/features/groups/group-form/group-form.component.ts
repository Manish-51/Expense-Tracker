import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Group, GroupCategory, Member } from '../../../core/models/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { StoreService } from '../../../core/services/store.service';

export interface GroupFormValue {
  name: string;
  category: GroupCategory;
  memberIds: string[];
  budget?: number;
}

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, AvatarComponent],
  template: `
    <form (ngSubmit)="onSubmit()" novalidate>
      <div class="field">
        <label for="gname">Group Name <span class="req">*</span></label>
        <input id="gname" type="text" [(ngModel)]="name" name="name" placeholder="e.g. Vacation, Flatmates" required maxlength="60" />
        <span class="err" *ngIf="submitted && !name.trim()">Group name is required.</span>
      </div>

      <div class="field">
        <label for="gcat">Category</label>
        <select id="gcat" [(ngModel)]="category" name="category">
          <option value="Trip">Trip</option>
          <option value="Home">Home</option>
          <option value="Office">Office</option>
          <option value="Friends">Friends</option>
          <option value="Family">Family</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div class="field">
        <label for="gbudget">Group Budget (optional)</label>
        <input id="gbudget" type="number" min="0" [(ngModel)]="budget" name="budget" placeholder="e.g. 30000" />
      </div>

      <div class="field">
        <div class="field-header">
          <label>Members <span class="req">*</span></label>
          <button type="button" class="quick-btn" (click)="showAddMember = !showAddMember">
            {{ showAddMember ? 'Cancel' : '+ New Member' }}
          </button>
        </div>

        <div class="quick-add-box" *ngIf="showAddMember">
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

        <div class="member-grid" *ngIf="allMembers.length > 0; else noMembers">
          <label class="member-check" *ngFor="let m of allMembers" [class.checked]="selectedIds.has(m.id)">
            <input
              type="checkbox"
              [checked]="selectedIds.has(m.id)"
              (change)="toggleMember(m.id)"
            />
            <app-avatar [name]="m.name" [color]="m.avatarColor" size="sm"></app-avatar>
            <span>{{ m.name }}</span>
          </label>
        </div>
        <ng-template #noMembers>
          <p class="empty-hint text-muted-app">No members yet. Click <strong>+ New Member</strong> above to define members for this group.</p>
        </ng-template>
        <span class="err" *ngIf="submitted && selectedIds.size === 0">Select at least one member.</span>
      </div>

      <div class="actions">
        <app-button variant="secondary" type="button" (onClick)="cancel.emit()">Cancel</app-button>
        <app-button variant="primary" type="submit">{{ initialGroup ? 'Save Changes' : 'Create Group' }}</app-button>
      </div>
    </form>
  `,
  styles: [`
    .field { margin-bottom: 18px; display: flex; flex-direction: column; gap: 6px; }
    .field-header { display: flex; justify-content: space-between; align-items: center; }
    label { font-size: 13px; font-weight: 600; color: var(--color-text-muted); }
    .req { color: var(--color-danger); }
    input[type='text'], input[type='number'], select {
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text);
      font-size: 14px;
    }
    input:focus, select:focus { outline: none; border-color: var(--color-primary); }
    .err { color: var(--color-danger); font-size: 12px; }

    .quick-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    .quick-btn:hover { text-decoration: underline; }

    .quick-add-box {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      padding: 8px;
      background: var(--color-surface-alt);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-sm);
    }
    .quick-add-box input {
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
      padding: 12px;
      background: var(--color-surface-alt);
      border-radius: var(--radius-sm);
      border: 1px dashed var(--color-border);
    }

    .member-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
      padding: 4px;
    }
    .member-check {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 13px;
    }
    .member-check.checked { border-color: var(--color-primary); background: var(--color-primary-light); }
    .member-check input { margin: 0; }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
      border-top: 1px solid var(--color-border);
      padding-top: 16px;
    }
  `],
})
export class GroupFormComponent implements OnChanges {
  @Input() allMembers: Member[] = [];
  @Input() initialGroup: Group | null = null;
  @Output() save = new EventEmitter<GroupFormValue>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  category: GroupCategory = 'Trip';
  budget?: number;
  selectedIds = new Set<string>();
  submitted = false;

  showAddMember = false;
  newMemberName = '';

  constructor(private store: StoreService) {}

  ngOnChanges(): void {
    if (this.initialGroup) {
      this.name = this.initialGroup.name;
      this.category = this.initialGroup.category;
      this.budget = this.initialGroup.budget;
      this.selectedIds = new Set(this.initialGroup.memberIds);
    } else {
      this.name = '';
      this.category = 'Trip';
      this.budget = undefined;
      this.selectedIds = new Set();
    }
    this.submitted = false;
    this.showAddMember = false;
    this.newMemberName = '';
  }

  toggleMember(id: string): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  addQuickMember(): void {
    const trimmed = this.newMemberName.trim();
    if (!trimmed) return;
    const newMember = this.store.addMember(trimmed, `${trimmed.toLowerCase().replace(/\s+/g, '.')}@example.com`);
    this.selectedIds.add(newMember.id);
    this.newMemberName = '';
    this.showAddMember = false;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.name.trim() || this.selectedIds.size === 0) return;
    this.save.emit({
      name: this.name.trim(),
      category: this.category,
      memberIds: Array.from(this.selectedIds),
      budget: this.budget && this.budget > 0 ? this.budget : undefined,
    });
  }
}
