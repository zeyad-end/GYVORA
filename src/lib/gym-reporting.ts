import type { Gym, Member, Plan, Session, Invoice } from './store';
import { dailySummary } from './gym-updates';

export type MembershipEvent = { id: string; memberId: string; date: string; price: number; kind: 'created' | 'renewed' };
export function gymToday(gym: Partial<Gym>, now = new Date()) {
  const timeZone = gym.preferences?.timeZone;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (name: string) => parts.find(p => p.type === name)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function membershipPrice(member: Member, plans: Plan[]) {
  return member.planPrice ?? plans.find(p => p.name === member.plan)?.price ?? 0;
}
export const sessionTotal = (sessions: Session[]) => sessions.reduce((sum, row) => sum + row.price, 0);
export function dashboardTotals(sessions: Session[], events: MembershipEvent[], invoices: Invoice[], date: string) {
  const sessionRevenue = sessionTotal(sessions.filter(s => s.date === date));
  const unique = new Map(events.map(e => [e.id, e]));
  const subscriptions = [...unique.values()].filter(e => e.date === date).reduce((sum, e) => sum + e.price, 0);
  const expenses = dailySummary(invoices, date);
  return { sessionRevenue, subscriptions, revenue: sessionRevenue + subscriptions, expenses: expenses.total, expenseCount: expenses.count, net: sessionRevenue + subscriptions - expenses.total };
}