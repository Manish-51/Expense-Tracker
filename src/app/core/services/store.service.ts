import { Injectable, computed, effect, signal } from '@angular/core';
import {
  AppNotification,
  Budget,
  Expense,
  Group,
  Member,
  ParticipantShare,
  Settlement,
  SplitType,
  Theme,
} from '../models/models';
import { LocalStorageService } from './local-storage.service';
import { currentMonthKey, generateMockData } from './mock-data';
import { computeBalances, resolveShares, round2 } from '../utils/expense-utils';
import { edgesToSettlements } from '../utils/settlement-utils';
import { simplifyDebts } from '../utils/expense-utils';

const STORAGE_KEYS = {
  members: 'splitwise.members',
  groups: 'splitwise.groups',
  expenses: 'splitwise.expenses',
  settlements: 'splitwise.settlements',
  notifications: 'splitwise.notifications',
  budgets: 'splitwise.budgets',
  theme: 'splitwise.theme',
  currentUser: 'splitwise.currentUser',
  seeded: 'splitwise.seeded',
};

/**
 * Central application store using Angular signals.
 * This is the Angular equivalent of a React Context + useReducer store:
 * all state lives here, components read via signals/computed, and
 * mutate via the action methods below. Every change is persisted to
 * localStorage automatically via effect().
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  // ---- raw state signals ----
  members = signal<Member[]>([]);
  groups = signal<Group[]>([]);
  expenses = signal<Expense[]>([]);
  settlements = signal<Settlement[]>([]);
  notifications = signal<AppNotification[]>([]);
  budgets = signal<Budget[]>([]);
  theme = signal<Theme>('light');

  /** The "logged in" member — dynamically selected from user-defined members */
  currentUserId = signal<string>('');

  constructor(private storage: LocalStorageService) {
    this.loadInitial();

    // Persist every state slice whenever it changes
    effect(() => this.storage.set(STORAGE_KEYS.members, this.members()));
    effect(() => this.storage.set(STORAGE_KEYS.groups, this.groups()));
    effect(() => this.storage.set(STORAGE_KEYS.expenses, this.expenses()));
    effect(() => this.storage.set(STORAGE_KEYS.settlements, this.settlements()));
    effect(() => this.storage.set(STORAGE_KEYS.notifications, this.notifications()));
    effect(() => this.storage.set(STORAGE_KEYS.budgets, this.budgets()));
    effect(() => {
      const t = this.theme();
      this.storage.set(STORAGE_KEYS.theme, t);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', t);
      }
    });
    effect(() => this.storage.set(STORAGE_KEYS.currentUser, this.currentUserId()));
  }

  private loadInitial(): void {
    // Clear any previously saved mock data with hardcoded usernames or expenses
    const savedMembers = this.storage.get<Member[]>(STORAGE_KEYS.members, []);
    const hasPreviousMockData = savedMembers.some((m) => m.id === 'm1' || m.name === 'Manish Maiti');
    if (hasPreviousMockData) {
      this.storage.remove(STORAGE_KEYS.members);
      this.storage.remove(STORAGE_KEYS.groups);
      this.storage.remove(STORAGE_KEYS.expenses);
      this.storage.remove(STORAGE_KEYS.settlements);
      this.storage.remove(STORAGE_KEYS.notifications);
      this.storage.remove(STORAGE_KEYS.budgets);
      this.storage.remove(STORAGE_KEYS.currentUser);
      this.storage.remove(STORAGE_KEYS.seeded);
    }

    const members = this.storage.get<Member[]>(STORAGE_KEYS.members, []);
    this.members.set(members);
    this.groups.set(this.storage.get<Group[]>(STORAGE_KEYS.groups, []));
    this.expenses.set(this.storage.get<Expense[]>(STORAGE_KEYS.expenses, []));
    this.settlements.set(this.storage.get<Settlement[]>(STORAGE_KEYS.settlements, []));
    this.notifications.set(this.storage.get<AppNotification[]>(STORAGE_KEYS.notifications, []));
    this.budgets.set(this.storage.get<Budget[]>(STORAGE_KEYS.budgets, []));
    this.theme.set(this.storage.get<Theme>(STORAGE_KEYS.theme, 'light'));

    const savedUid = this.storage.get<string>(STORAGE_KEYS.currentUser, '');
    if (savedUid && members.some((m) => m.id === savedUid)) {
      this.currentUserId.set(savedUid);
    } else if (members.length > 0) {
      this.currentUserId.set(members[0].id);
    } else {
      this.currentUserId.set('');
    }
  }

  setCurrentUser(id: string): void {
    this.currentUserId.set(id);
  }

  // ============================================================
  // COMPUTED / DERIVED STATE
  // ============================================================

  currentUser = computed(() => this.members().find((m) => m.id === this.currentUserId()));

  memberById = computed(() => {
    const map = new Map<string, Member>();
    this.members().forEach((m) => map.set(m.id, m));
    return map;
  });

  groupById = computed(() => {
    const map = new Map<string, Group>();
    this.groups().forEach((g) => map.set(g.id, g));
    return map;
  });

  /** Overall balances for every member across ALL expenses */
  overallBalances = computed(() => computeBalances(this.expenses(), this.members().map((m) => m.id)));

  totalExpenses = computed(() => round2(this.expenses().reduce((sum, e) => sum + e.amount, 0)));

  currentUserStats = computed(() => {
    const uid = this.currentUserId();
    const balances = this.overallBalances();
    const mine = balances.find((b) => b.memberId === uid);
    const youOwe = mine && mine.balance < 0 ? Math.abs(mine.balance) : 0;
    const youAreOwed = mine && mine.balance > 0 ? mine.balance : 0;
    const youPaid = round2(this.expenses().filter((e) => e.paidBy === uid).reduce((s, e) => s + e.amount, 0));
    return { youPaid, youOwe, youAreOwed, netBalance: mine?.balance ?? 0 };
  });

  activeGroupsCount = computed(() => this.groups().length);

  pendingSettlementsCount = computed(
    () => this.settlements().filter((s) => s.status === 'pending').length
  );

  unreadNotificationsCount = computed(
    () => this.notifications().filter((n) => !n.read).length
  );

  /** Balances scoped to a single group */
  groupBalances(groupId: string) {
    return computed(() => {
      const group = this.groupById().get(groupId);
      if (!group) return [];
      const groupExpenses = this.expenses().filter((e) => e.groupId === groupId);
      return computeBalances(groupExpenses, group.memberIds);
    });
  }

  groupTotalSpending(groupId: string) {
    return computed(() =>
      round2(this.expenses().filter((e) => e.groupId === groupId).reduce((s, e) => s + e.amount, 0))
    );
  }

  // ============================================================
  // GROUP ACTIONS
  // ============================================================

  addGroup(name: string, category: Group['category'], memberIds: string[], budget?: number): Group {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      category,
      memberIds,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      budget,
    };
    this.groups.update((groups) => [newGroup, ...groups]);
    this.pushNotification('group', `You created a new group: ${name}.`);
    return newGroup;
  }

  updateGroup(groupId: string, changes: Partial<Omit<Group, 'id'>>): void {
    this.groups.update((groups) =>
      groups.map((g) => (g.id === groupId ? { ...g, ...changes, lastActivity: new Date().toISOString() } : g))
    );
  }

  deleteGroup(groupId: string): void {
    this.groups.update((groups) => groups.filter((g) => g.id !== groupId));
    this.expenses.update((expenses) => expenses.filter((e) => e.groupId !== groupId));
    this.settlements.update((settlements) => settlements.filter((s) => s.groupId !== groupId));
  }

  addMemberToGroup(groupId: string, memberId: string): void {
    this.groups.update((groups) =>
      groups.map((g) =>
        g.id === groupId && !g.memberIds.includes(memberId)
          ? { ...g, memberIds: [...g.memberIds, memberId], lastActivity: new Date().toISOString() }
          : g
      )
    );
  }

  removeMemberFromGroup(groupId: string, memberId: string): void {
    this.groups.update((groups) =>
      groups.map((g) =>
        g.id === groupId
          ? { ...g, memberIds: g.memberIds.filter((id) => id !== memberId), lastActivity: new Date().toISOString() }
          : g
      )
    );
  }

  // ============================================================
  // MEMBER ACTIONS
  // ============================================================

  private readonly avatarPalette = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

  addMember(name: string, email: string): Member {
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      email,
      avatarColor: this.avatarPalette[this.members().length % this.avatarPalette.length],
      createdAt: new Date().toISOString(),
    };
    this.members.update((members) => [...members, newMember]);
    if (!this.currentUserId()) {
      this.currentUserId.set(newMember.id);
    }
    this.pushNotification('reminder', `Added member: ${name}.`);
    return newMember;
  }

  updateMember(memberId: string, changes: Partial<Omit<Member, 'id'>>): void {
    this.members.update((members) => members.map((m) => (m.id === memberId ? { ...m, ...changes } : m)));
  }

  deleteMember(memberId: string): void {
    const target = this.members().find((m) => m.id === memberId);
    this.members.update((members) => members.filter((m) => m.id !== memberId));
    this.groups.update((groups) =>
      groups.map((g) => ({ ...g, memberIds: g.memberIds.filter((id) => id !== memberId) }))
    );
    if (this.currentUserId() === memberId) {
      const remaining = this.members();
      this.currentUserId.set(remaining.length > 0 ? remaining[0].id : '');
    }
    if (target) {
      this.pushNotification('reminder', `Removed member: ${target.name}.`);
    }
  }

  memberStats(memberId: string) {
    return computed(() => {
      const paid = round2(this.expenses().filter((e) => e.paidBy === memberId).reduce((s, e) => s + e.amount, 0));
      const share = round2(
        this.expenses().reduce((sum, e) => {
          const p = e.participants.find((pt) => pt.memberId === memberId);
          return sum + (p ? p.share : 0);
        }, 0)
      );
      const received = round2(
        this.settlements()
          .filter((s) => s.toMemberId === memberId && s.status === 'paid')
          .reduce((sum, s) => sum + s.amount, 0)
      );
      return { paid, owed: share, received, balance: round2(paid - share) };
    });
  }

  // ============================================================
  // EXPENSE ACTIONS
  // ============================================================

  addExpense(input: {
    title: string;
    amount: number;
    paidBy: string;
    groupId: string;
    participantIds: string[];
    splitType: SplitType;
    rawValues?: Record<string, number>;
    date: string;
    category: Expense['category'];
    notes?: string;
  }): Expense {
    const participants: ParticipantShare[] = resolveShares(
      input.amount,
      input.participantIds,
      input.splitType,
      input.rawValues
    );

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      title: input.title,
      amount: input.amount,
      paidBy: input.paidBy,
      groupId: input.groupId,
      participants,
      splitType: input.splitType,
      date: input.date,
      category: input.category,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    this.expenses.update((expenses) => [newExpense, ...expenses]);
    this.updateGroup(input.groupId, {});

    const payerName = this.memberById().get(input.paidBy)?.name ?? 'Someone';
    this.pushNotification('expense', `${payerName} added a new expense of ₹${input.amount.toLocaleString('en-IN')}.`);

    this.recalculateGroupSettlements(input.groupId);
    this.checkBudgetWarnings(input.groupId);

    return newExpense;
  }

  updateExpense(expenseId: string, changes: Partial<Omit<Expense, 'id'>>): void {
    this.expenses.update((expenses) =>
      expenses.map((e) => {
        if (e.id !== expenseId) return e;
        const merged = { ...e, ...changes };
        if (changes.amount !== undefined || changes.splitType !== undefined || (changes as any).participantIds) {
          const participantIds = (changes as any).participantIds ?? e.participants.map((p) => p.memberId);
          merged.participants = resolveShares(
            merged.amount,
            participantIds,
            merged.splitType,
            (changes as any).rawValues
          );
        }
        return merged;
      })
    );
    const groupId = this.expenses().find((e) => e.id === expenseId)?.groupId;
    if (groupId) this.recalculateGroupSettlements(groupId);
    this.pushNotification('expense', `Updated expense details.`);
  }

  deleteExpense(expenseId: string): void {
    const exp = this.expenses().find((e) => e.id === expenseId);
    this.expenses.update((expenses) => expenses.filter((e) => e.id !== expenseId));
    if (exp) {
      this.pushNotification('expense', `Deleted expense "${exp.title}" (₹${exp.amount.toLocaleString('en-IN')}).`);
      this.recalculateGroupSettlements(exp.groupId);
    }
  }

  // ============================================================
  // SETTLEMENT ACTIONS
  // ============================================================

  private recalculateGroupSettlements(groupId: string): void {
    const group = this.groupById().get(groupId);
    if (!group) return;
    const groupExpenses = this.expenses().filter((e) => e.groupId === groupId);
    const balances = computeBalances(groupExpenses, group.memberIds);
    const edges = simplifyDebts(balances);
    const newPending = edgesToSettlements(edges, groupId, this.settlements());
    if (newPending.length > 0) {
      this.settlements.update((settlements) => [...newPending, ...settlements]);
    }
  }

  addSettlement(groupId: string, fromMemberId: string, toMemberId: string, amount: number): Settlement {
    const newSettlement: Settlement = {
      id: crypto.randomUUID(),
      groupId,
      fromMemberId,
      toMemberId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.settlements.update((settlements) => [newSettlement, ...settlements]);
    return newSettlement;
  }

  markSettlementPaid(settlementId: string): void {
    let fromName = '';
    let amount = 0;
    this.settlements.update((settlements) =>
      settlements.map((s) => {
        if (s.id !== settlementId) return s;
        fromName = this.memberById().get(s.fromMemberId)?.name ?? 'Someone';
        amount = s.amount;
        return { ...s, status: 'paid' as const, paidAt: new Date().toISOString() };
      })
    );
    if (fromName) {
      this.pushNotification('settlement', `${fromName} settled ₹${amount.toLocaleString('en-IN')}.`);
    }
  }

  markSettlementPending(settlementId: string): void {
    this.settlements.update((settlements) =>
      settlements.map((s) => (s.id === settlementId ? { ...s, status: 'pending' as const, paidAt: undefined } : s))
    );
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  pushNotification(type: AppNotification['type'], message: string): void {
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.notifications.update((list) => [notification, ...list].slice(0, 50));
  }

  markNotificationRead(id: string): void {
    this.notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllNotificationsRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  clearNotifications(): void {
    this.notifications.set([]);
  }

  // ============================================================
  // BUDGETS
  // ============================================================

  setBudget(scope: Budget['scope'], refId: string, amount: number): void {
    this.budgets.update((budgets) => {
      const existing = budgets.find((b) => b.scope === scope && b.refId === refId);
      if (existing) {
        return budgets.map((b) => (b.id === existing.id ? { ...b, amount } : b));
      }
      return [...budgets, { id: crypto.randomUUID(), scope, refId, amount }];
    });
  }

  budgetFor(scope: Budget['scope'], refId: string) {
    return computed(() => this.budgets().find((b) => b.scope === scope && b.refId === refId));
  }

  private checkBudgetWarnings(groupId: string): void {
    const group = this.groupById().get(groupId);
    if (!group?.budget) return;
    const spent = this.expenses().filter((e) => e.groupId === groupId).reduce((s, e) => s + e.amount, 0);
    const pct = (spent / group.budget) * 100;
    if (pct >= 100) {
      this.pushNotification('budget', `${group.name} exceeded the planned budget.`);
    } else if (pct >= 90) {
      this.pushNotification('budget', `${group.name} reached 90% of its planned budget.`);
    } else if (pct >= 80) {
      this.pushNotification('budget', `${group.name} reached 80% of its planned budget.`);
    }
  }

  // ============================================================
  // THEME
  // ============================================================

  toggleTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  // ============================================================
  // MISC
  // ============================================================

  currentMonthKey = currentMonthKey;
}
