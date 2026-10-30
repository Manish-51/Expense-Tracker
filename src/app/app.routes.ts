import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { GroupsPage } from './features/groups/groups.page';
import { GroupDetailsPage } from './features/group-details/group-details.page';
import { ExpensesPage } from './features/expenses/expenses.page';
import { SettlementsPage } from './features/settlements/settlements.page';
import { MembersPage } from './features/members/members.page';
import { AnalyticsPage } from './features/analytics/analytics.page';
import { SettingsPage } from './features/settings/settings.page';
import { NotFoundPage } from './features/not-found/not-found.page';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: DashboardPage, title: 'Dashboard · SplitWise Pro' },
      { path: 'groups', component: GroupsPage, title: 'Groups · SplitWise Pro' },
      { path: 'groups/:groupId', component: GroupDetailsPage, title: 'Group Details · SplitWise Pro' },
      { path: 'expenses', component: ExpensesPage, title: 'Expenses · SplitWise Pro' },
      { path: 'settlements', component: SettlementsPage, title: 'Settlements · SplitWise Pro' },
      { path: 'members', component: MembersPage, title: 'Members · SplitWise Pro' },
      { path: 'analytics', component: AnalyticsPage, title: 'Analytics · SplitWise Pro' },
      { path: 'settings', component: SettingsPage, title: 'Settings · SplitWise Pro' },
      { path: '**', component: NotFoundPage, title: 'Not Found · SplitWise Pro' },
    ],
  },
];
