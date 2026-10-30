import { DebtEdge, Expense, MemberBalance, ParticipantShare, SplitType } from '../models/models';

/**
 * Resolves participant shares for a new/edited expense based on split type.
 *
 * equal:      amount split evenly across all participantIds
 * unequal:    rawValues are literal rupee amounts per participant (must sum to amount)
 * percentage: rawValues are percentages per participant (must sum to 100)
 * exact:      rawValues are literal rupee amounts per participant (must sum to amount)
 */
export function resolveShares(
  amount: number,
  participantIds: string[],
  splitType: SplitType,
  rawValues?: Record<string, number>
): ParticipantShare[] {
  if (participantIds.length === 0) return [];

  switch (splitType) {
    case 'equal': {
      const base = Math.floor((amount / participantIds.length) * 100) / 100;
      const shares = participantIds.map((memberId) => ({ memberId, share: base }));
      // distribute rounding remainder to the first participant(s) so totals match exactly
      const distributed = shares.reduce((sum, s) => sum + s.share, 0);
      const remainder = Math.round((amount - distributed) * 100) / 100;
      if (remainder !== 0 && shares.length > 0) {
        shares[0].share = Math.round((shares[0].share + remainder) * 100) / 100;
      }
      return shares;
    }

    case 'unequal':
    case 'exact': {
      return participantIds.map((memberId) => ({
        memberId,
        value: rawValues?.[memberId] ?? 0,
        share: rawValues?.[memberId] ?? 0,
      }));
    }

    case 'percentage': {
      return participantIds.map((memberId) => {
        const pct = rawValues?.[memberId] ?? 0;
        return {
          memberId,
          value: pct,
          share: Math.round(((amount * pct) / 100) * 100) / 100,
        };
      });
    }

    default:
      return [];
  }
}

/** Validates that resolved shares sum to the expense amount (within 1 paisa tolerance) */
export function validateShares(amount: number, shares: ParticipantShare[]): boolean {
  const total = shares.reduce((sum, s) => sum + s.share, 0);
  return Math.abs(total - amount) < 0.01;
}

/**
 * Computes balances for every member across a set of expenses.
 * balance > 0  => this member is owed money (gets back)
 * balance < 0  => this member owes money
 */
export function computeBalances(expenses: Expense[], memberIds: string[]): MemberBalance[] {
  const paidMap = new Map<string, number>();
  const shareMap = new Map<string, number>();
  memberIds.forEach((id) => {
    paidMap.set(id, 0);
    shareMap.set(id, 0);
  });

  expenses.forEach((exp) => {
    paidMap.set(exp.paidBy, (paidMap.get(exp.paidBy) ?? 0) + exp.amount);
    exp.participants.forEach((p) => {
      shareMap.set(p.memberId, (shareMap.get(p.memberId) ?? 0) + p.share);
    });
  });

  return memberIds.map((memberId) => {
    const paid = round2(paidMap.get(memberId) ?? 0);
    const share = round2(shareMap.get(memberId) ?? 0);
    return { memberId, paid, share, balance: round2(paid - share) };
  });
}

/**
 * Simplifies debts within a group into the minimum number of transactions
 * using a greedy max-debtor-to-max-creditor algorithm.
 */
export function simplifyDebts(balances: MemberBalance[]): DebtEdge[] {
  const creditors = balances
    .filter((b) => b.balance > 0.005)
    .map((b) => ({ id: b.memberId, amt: b.balance }))
    .sort((a, b) => b.amt - a.amt);

  const debtors = balances
    .filter((b) => b.balance < -0.005)
    .map((b) => ({ id: b.memberId, amt: -b.balance }))
    .sort((a, b) => b.amt - a.amt);

  const edges: DebtEdge[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settled = Math.min(debtor.amt, creditor.amt);

    if (settled > 0.005) {
      edges.push({
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        amount: round2(settled),
      });
    }

    debtor.amt = round2(debtor.amt - settled);
    creditor.amt = round2(creditor.amt - settled);

    if (debtor.amt <= 0.005) i++;
    if (creditor.amt <= 0.005) j++;
  }

  return edges;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function sumBy<T>(items: T[], fn: (item: T) => number): number {
  return round2(items.reduce((sum, item) => sum + fn(item), 0));
}

export function averageBy<T>(items: T[], fn: (item: T) => number): number {
  if (items.length === 0) return 0;
  return round2(sumBy(items, fn) / items.length);
}

export function groupByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((acc, exp) => {
    acc[exp.category] = round2((acc[exp.category] ?? 0) + exp.amount);
    return acc;
  }, {} as Record<string, number>);
}

export function groupByMonth(expenses: Expense[]): { month: string; total: number }[] {
  const map = new Map<string, number>();
  expenses.forEach((exp) => {
    const d = new Date(exp.date);
    const key = `${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}`;
    map.set(key, round2((map.get(key) ?? 0) + exp.amount));
  });
  return Array.from(map.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}
