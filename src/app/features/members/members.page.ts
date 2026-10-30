import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, UserCircle } from 'lucide-angular';
import { StoreService } from '../../core/services/store.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { MemberCardComponent } from './member-card/member-card.component';
import { MemberFormComponent, MemberFormValue } from './member-form/member-form.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Member } from '../../core/models/models';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    PageHeaderComponent,
    MemberCardComponent,
    MemberFormComponent,
    ButtonComponent,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Members" subtitle="Everyone you split expenses with">
        <app-button (onClick)="openCreate()">
          <lucide-angular [img]="PlusIcon" [size]="16"></lucide-angular>
          Add Member
        </app-button>
      </app-page-header>

      <div class="grid" *ngIf="store.members().length > 0; else empty">
        <app-member-card
          *ngFor="let m of store.members()"
          [member]="m"
          [stats]="store.memberStats(m.id)()"
          (edit)="openEdit(m)"
          (delete)="confirmDelete(m)"
        ></app-member-card>
      </div>

      <ng-template #empty>
        <app-empty-state
          [icon]="UserCircleIcon"
          title="No members yet"
          description="Add people to start splitting expenses with them."
        >
          <app-button (onClick)="openCreate()">Add Member</app-button>
        </app-empty-state>
      </ng-template>
    </div>

    <app-modal [open]="formOpen()" [title]="editingMember() ? 'Edit Member' : 'Add Member'" size="sm" (close)="formOpen.set(false)">
      <app-member-form [initialMember]="editingMember()" (save)="handleSave($event)" (cancel)="formOpen.set(false)"></app-member-form>
    </app-modal>

    <app-confirm-dialog
      [open]="deleteTarget() !== null"
      title="Remove Member"
      [message]="'Remove \\'' + (deleteTarget()?.name || '') + '\\' from all groups? Their past expenses remain in history.'"
      (confirm)="doDelete()"
      (cancel)="deleteTarget.set(null)"
    ></app-confirm-dialog>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }
  `],
})
export class MembersPage {
  readonly PlusIcon = Plus;
  readonly UserCircleIcon = UserCircle;

  formOpen = signal(false);
  editingMember = signal<Member | null>(null);
  deleteTarget = signal<Member | null>(null);

  constructor(public store: StoreService) {}

  openCreate(): void {
    this.editingMember.set(null);
    this.formOpen.set(true);
  }

  openEdit(m: Member): void {
    this.editingMember.set(m);
    this.formOpen.set(true);
  }

  handleSave(value: MemberFormValue): void {
    const editing = this.editingMember();
    if (editing) {
      this.store.updateMember(editing.id, value);
    } else {
      this.store.addMember(value.name, value.email);
    }
    this.formOpen.set(false);
  }

  confirmDelete(m: Member): void {
    this.deleteTarget.set(m);
  }

  doDelete(): void {
    const target = this.deleteTarget();
    if (target) this.store.deleteMember(target.id);
    this.deleteTarget.set(null);
  }
}
