import {
  AppNotification,
  Budget,
  Expense,
  Group,
  Member,
  Settlement,
} from '../models/models';

/**
 * Returns empty initial datasets.
 * No hardcoded usernames, members, or expenses are saved in the codebase.
 * All members, groups, and expenses are defined dynamically by the user via the web interface.
 */
export function generateMockData(): {
  members: Member[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  notifications: AppNotification[];
  budgets: Budget[];
} {
  return {
    members: [],
    groups: [],
    expenses: [],
    settlements: [],
    notifications: [],
    budgets: [],
  };
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
