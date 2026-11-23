import type { SplitMode, TripDetails, TripExpense, TripMember } from "../types";

export interface Settlement {
  from: string;
  to: string;
  amountPaise: number;
}

export interface CalculatedMember extends TripMember {
  paidPaise: number;
  sharePaise: number;
  netPaise: number;
}

function toFixedUnits(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.round(value * 10000) : 0;
}

/**
 * Distribute integer paise using largest remainder allocation. The result
 * always adds up to the original amount, even when the amount cannot divide
 * evenly between participants.
 */
function apportion(amountPaise: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (amountPaise <= 0 || totalWeight <= 0) return weights.map(() => 0);

  const raw = weights.map((weight) => (amountPaise * weight) / totalWeight);
  const result = raw.map(Math.floor);
  let remainder = amountPaise - result.reduce((sum, amount) => sum + amount, 0);

  raw
    .map((value, index) => ({ index, remainder: value - result[index] }))
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
    .forEach(({ index }) => {
      if (remainder > 0) {
        result[index] += 1;
        remainder -= 1;
      }
    });

  return result;
}

export function getExpenseShares(expense: TripExpense): Record<string, number> {
  const participants = [...new Set(expense.participants)];
  const mode: SplitMode = expense.splitMode ?? "equal";

  if (participants.length === 0) return {};

  const weights = participants.map((memberId) => {
    const value = expense.splitValues?.[memberId] ?? 0;
    return mode === "equal" ? 1 : toFixedUnits(value);
  });

  const effectiveWeights = weights.some((weight) => weight > 0)
    ? weights
    : weights.map(() => 1);
  const amounts = apportion(expense.amountPaise, effectiveWeights);

  return Object.fromEntries(
    participants.map((memberId, index) => [memberId, amounts[index]]),
  );
}

export function calculateMemberBalances(trip: TripDetails): CalculatedMember[] {
  const paid = new Map(trip.members.map((member) => [member.id, 0]));
  const shares = new Map(trip.members.map((member) => [member.id, 0]));

  trip.expenses.forEach((expense) => {
    paid.set(expense.paidBy, (paid.get(expense.paidBy) ?? 0) + expense.amountPaise);
    Object.entries(getExpenseShares(expense)).forEach(([memberId, amount]) => {
      shares.set(memberId, (shares.get(memberId) ?? 0) + amount);
    });
  });

  return trip.members.map((member) => {
    const paidPaise = paid.get(member.id) ?? 0;
    const sharePaise = shares.get(member.id) ?? 0;
    return { ...member, paidPaise, sharePaise, netPaise: paidPaise - sharePaise };
  });
}

export function calculateSettlements(members: TripMember[]): Settlement[] {
  const creditors = members
    .filter((member) => member.netPaise > 0)
    .map((member) => ({ id: member.id, amount: member.netPaise }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = members
    .filter((member) => member.netPaise < 0)
    .map((member) => ({ id: member.id, amount: Math.abs(member.netPaise) }))
    .sort((a, b) => b.amount - a.amount);
  const settlements: Settlement[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amountPaise = Math.min(creditor.amount, debtor.amount);

    if (amountPaise > 0) settlements.push({ from: debtor.id, to: creditor.id, amountPaise });

    creditor.amount -= amountPaise;
    debtor.amount -= amountPaise;
    if (creditor.amount === 0) creditorIndex += 1;
    if (debtor.amount === 0) debtorIndex += 1;
  }

  return settlements;
}

export function recalculateTrip(trip: TripDetails): TripDetails {
  return { ...trip, members: calculateMemberBalances(trip) };
}
