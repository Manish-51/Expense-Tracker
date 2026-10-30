// ============================================================
// SplitWise Pro — Core Data Models
// ============================================================

export type SplitType = 'equal' | 'unequal' | 'percentage' | 'exact';

export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Hotel'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Other';

export type GroupCategory =
  | 'Trip'
  | 'Home'
  | 'Office'
  | 'Friends'
  | 'Family'
  | 'Other';

export type SettlementStatus = 'pending' | 'paid';

export type NotificationType =
  | 'expense'
  | 'settlement'
  | 'budget'
  | 'group'
  | 'reminder';

export type Theme = 'light' | 'dark';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  category: GroupCategory;
  memberIds: string[];
  createdAt: string;
  lastActivity: string;
  budget?: number;
}

/** How much a single participant owes for a given expense */
export interface ParticipantShare {
  memberId: string;
  /** for unequal: raw share amount; for percentage: percent value; for exact: exact amount; for equal: unused */
  value?: number;
  share: number; // resolved amount owed by this participant
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // memberId
  groupId: string;
  participants: ParticipantShare[]; // resolved shares
  splitType: SplitType;
  date: string; // ISO date
  category: ExpenseCategory;
  notes?: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromMemberId: string; // owes
  toMemberId: string; // is owed
  amount: number;
  status: SettlementStatus;
  createdAt: string;
  paidAt?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Budget {
  id: string;
  scope: 'group' | 'monthly' | 'category';
  refId: string; // groupId, 'YYYY-MM', or category name
  amount: number;
}

/** Computed balance for a member within a group (or overall) */
export interface MemberBalance {
  memberId: string;
  paid: number;
  share: number;
  balance: number; // paid - share ; positive = gets back, negative = owes
}

/** A simplified debt edge produced by the settlement simplification algorithm */
export interface DebtEdge {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}
