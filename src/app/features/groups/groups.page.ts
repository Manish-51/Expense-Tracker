import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Users } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { GroupCardComponent } from './group-card/group-card.component';
import { GroupFormComponent, GroupFormValue } from './group-form/group-form.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Group } from '../../core/models/models';

@Component({
  selector: 'app-groups-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    GroupCardComponent,
    GroupFormComponent,
    ButtonComponent,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Groups" subtitle="Manage your shared expense groups">
        <app-button (onClick)="openCreate()">
          <lucide-angular [img]="PlusIcon" [size]="16"></lucide-angular>
          New Group
        </app-button>
      </app-page-header>

      <div class="grid" *ngIf="groups().length > 0; else empty">
        <app-group-card
          *ngFor="let g of groups()"
          [group]="g"
          [members]="membersOf(g)"
          [totalSpending]="store.groupTotalSpending(g.id)()"
          [myBalance]="myBalanceIn(g)"
          (cardClick)="router.navigate(['/groups', g.id])"
          (edit)="openEdit(g)"
          (delete)="confirmDelete(g)"
        ></app-group-card>
      </div>

      <ng-template #empty>
        <app-empty-state
          [icon]="UsersIcon"
          title="No groups yet"
          description="Create your first group to start splitting expenses with friends, flatmates, or colleagues."
        >
          <app-button (onClick)="openCreate()">Create a Group</app-button>
        </app-empty-state>
      </ng-template>
    </div>

    <app-modal [open]="formOpen()" [title]="editingGroup() ? 'Edit Group' : 'Create Group'" (close)="formOpen.set(false)">
      <app-group-form
        [allMembers]="store.members()"
        [initialGroup]="editingGroup()"
        (save)="handleSave($event)"
        (cancel)="formOpen.set(false)"
      ></app-group-form>
    </app-modal>

    <app-confirm-dialog
      [open]="deleteTarget() !== null"
      title="Delete Group"
      [message]="'Delete \\'' + (deleteTarget()?.name || '') + '\\'? All its expenses and settlements will be removed. This cannot be undone.'"
      (confirm)="doDelete()"
      (cancel)="deleteTarget.set(null)"
    ></app-confirm-dialog>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
  `],
})
export class GroupsPage {
  readonly PlusIcon = Plus;
  readonly UsersIcon = Users;

  groups = computed(() => this.store.groups());
  formOpen = signal(false);
  editingGroup = signal<Group | null>(null);
  deleteTarget = signal<Group | null>(null);

  constructor(public store: StoreService, public router: Router) {}

  membersOf(g: Group) {
    const map = this.store.memberById();
    return g.memberIds.map((id) => map.get(id)).filter((m): m is NonNullable<typeof m> => !!m);
  }

  myBalanceIn(g: Group): number {
    const balances = this.store.groupBalances(g.id)();
    return balances.find((b) => b.memberId === this.store.currentUserId())?.balance ?? 0;
  }

  openCreate(): void {
    this.editingGroup.set(null);
    this.formOpen.set(true);
  }

  openEdit(g: Group): void {
    this.editingGroup.set(g);
    this.formOpen.set(true);
  }

  handleSave(value: GroupFormValue): void {
    const editing = this.editingGroup();
    if (editing) {
      this.store.updateGroup(editing.id, value);
    } else {
      this.store.addGroup(value.name, value.category, value.memberIds, value.budget);
    }
    this.formOpen.set(false);
  }

  confirmDelete(g: Group): void {
    this.deleteTarget.set(g);
  }

  doDelete(): void {
    const target = this.deleteTarget();
    if (target) this.store.deleteGroup(target.id);
    this.deleteTarget.set(null);
  }
}
