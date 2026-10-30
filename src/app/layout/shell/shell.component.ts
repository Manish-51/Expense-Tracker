import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MobileNavbarComponent } from '../mobile-navbar/mobile-navbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent, MobileNavbarComponent],
  template: `
    <div class="shell">
      <app-sidebar [collapsed]="collapsed()" (toggleCollapsed)="collapsed.set(!collapsed())"></app-sidebar>
      <div class="shell-main">
        <app-navbar></app-navbar>
        <main class="shell-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-mobile-navbar></app-mobile-navbar>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      min-height: 100vh;
    }
    .shell-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .shell-content {
      flex: 1;
    }
  `],
})
export class ShellComponent {
  collapsed = signal(false);
}
