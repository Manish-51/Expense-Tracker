import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Member } from '../../../core/models/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';

export interface MemberFormValue {
  name: string;
  email: string;
}

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <form (ngSubmit)="onSubmit()" novalidate>
      <div class="field">
        <label for="mname">Full Name <span class="req">*</span></label>
        <input id="mname" type="text" [(ngModel)]="name" name="name" placeholder="Enter full name" required maxlength="60" />
        <span class="err" *ngIf="submitted && !name.trim()">Name is required.</span>
      </div>
      <div class="field">
        <label for="memail">Email <span class="req">*</span></label>
        <input id="memail" type="email" [(ngModel)]="email" name="email" placeholder="name@example.com" required />
        <span class="err" *ngIf="submitted && !isValidEmail">Enter a valid email address.</span>
      </div>
      <div class="actions">
        <app-button variant="secondary" type="button" (onClick)="cancel.emit()">Cancel</app-button>
        <app-button variant="primary" type="submit">{{ initialMember ? 'Save Changes' : 'Add Member' }}</app-button>
      </div>
    </form>
  `,
  styles: [`
    .field { margin-bottom: 18px; display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 13px; font-weight: 600; color: var(--color-text-muted); }
    .req { color: var(--color-danger); }
    input {
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
      color: var(--color-text);
      font-size: 14px;
    }
    input:focus { outline: none; border-color: var(--color-primary); }
    .err { color: var(--color-danger); font-size: 12px; }
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
export class MemberFormComponent implements OnChanges {
  @Input() initialMember: Member | null = null;
  @Output() save = new EventEmitter<MemberFormValue>();
  @Output() cancel = new EventEmitter<void>();

  name = '';
  email = '';
  submitted = false;

  ngOnChanges(): void {
    this.name = this.initialMember?.name ?? '';
    this.email = this.initialMember?.email ?? '';
    this.submitted = false;
  }

  get isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.name.trim() || !this.isValidEmail) return;
    this.save.emit({ name: this.name.trim(), email: this.email.trim() });
  }
}
