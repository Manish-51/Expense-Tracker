import { DebtEdge, Settlement } from '../models/models';

/** Converts simplified debt edges into pending Settlement records, avoiding duplicates already present */
export function edgesToSettlements(
  edges: DebtEdge[],
  groupId: string,
  existing: Settlement[]
): Settlement[] {
  const existingPending = new Set(
    existing
      .filter((s) => s.groupId === groupId && s.status === 'pending')
      .map((s) => `${s.fromMemberId}->${s.toMemberId}`)
  );

  const now = new Date().toISOString();
  return edges
    .filter((e) => !existingPending.has(`${e.fromMemberId}->${e.toMemberId}`))
    .map((e) => ({
      id: crypto.randomUUID(),
      groupId,
      fromMemberId: e.fromMemberId,
      toMemberId: e.toMemberId,
      amount: e.amount,
      status: 'pending' as const,
      createdAt: now,
    }));
}

export function totalPending(settlements: Settlement[]): number {
  return settlements
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0);
}
