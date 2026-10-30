import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-wrap">
      <div class="progress-track" role="progressbar" [attr.aria-valuenow]="clampedPct" aria-valuemin="0" aria-valuemax="100">
        <div
          class="progress-fill"
          [ngClass]="fillClass"
          [style.width.%]="clampedPct"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-track {
      width: 100%;
      height: 8px;
      background: var(--color-surface-alt);
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid var(--color-border);
    }
    .progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.35s ease;
    }
    .fill-ok { background: var(--color-success); }
    .fill-warn { background: var(--color-warning); }
    .fill-danger { background: var(--color-danger); }
  `],
})
export class ProgressBarComponent {
  @Input() percent = 0;

  get clampedPct(): number {
    return Math.max(0, Math.min(100, this.percent));
  }

  get fillClass(): string {
    if (this.percent >= 100) return 'fill-danger';
    if (this.percent >= 80) return 'fill-warn';
    return 'fill-ok';
  }
}
