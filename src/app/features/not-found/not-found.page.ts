import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Compass } from 'lucide-angular';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    <div class="not-found">
      <div class="icon-wrap">
        <lucide-angular [img]="CompassIcon" [size]="40"></lucide-angular>
      </div>
      <h1>404</h1>
      <h2>Page not found</h2>
      <p class="text-muted-app">The page you're looking for doesn't exist or may have been moved.</p>
      <app-button (onClick)="router.navigate(['/'])">Back to Dashboard</app-button>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 8px;
      padding: 24px;
    }
    .icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    h1 { font-size: 56px; }
    h2 { font-size: 20px; margin-bottom: 4px; }
    p { max-width: 360px; margin-bottom: 16px; }
  `],
})
export class NotFoundPage {
  readonly CompassIcon = Compass;
  constructor(public router: Router) {}
}
