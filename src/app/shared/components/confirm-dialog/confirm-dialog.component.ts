import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal [open]="open" [title]="title" size="sm" (close)="onCancel()">
      <p class="msg">{{ message }}</p>
      <div class="actions">
        <app-button variant="secondary" (onClick)="onCancel()">Cancel</app-button>
        <app-button variant="danger" (onClick)="onConfirm()">{{ confirmLabel }}</app-button>
      </div>
    </app-modal>
  `,
  styles: [`
    .msg { color: var(--color-text-muted); font-size: 14px; line-height: 1.6; }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Delete';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }
  onCancel(): void {
    this.cancel.emit();
  }
}
