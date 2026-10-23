import type { Member } from './store';

export function assertUniqueClientMembership(rows: Member[], clientId: string | undefined, recordId?: string) {
  if (clientId && rows.some(row => row.clientId === clientId && row.id !== recordId)) {
    throw new Error('This client already has a membership at this gym. Edit their existing membership instead.');
  }
}

export function membershipStatus(m: Pick<Member, 'start' | 'expiry'>, today: string): Member['status'] | 'Upcoming' {
  if (m.start > today) return 'Upcoming';
  if (m.expiry < today) return 'Expired';
  const days = (Date.parse(m.expiry) - Date.parse(today)) / 86400000;
  return days <= 14 ? 'Expiring' : 'Active';
}