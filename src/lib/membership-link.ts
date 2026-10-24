import type { Member } from './store';

export function isClientPortalPath(path: string) {
  return path === '/member' || path.startsWith('/member/');
}

export function assertUniqueClientMembership(rows: Member[], clientId: string | undefined, recordId?: string) {
  if (clientId && rows.some(row => row.clientId === clientId && row.id !== recordId)) {
    throw new Error('This client already has a membership at this gym. Edit their existing membership instead.');
  }
}

// Validate creation/relinking only. Legacy duplicates must not block edits,
// renewals or deletion of an existing record (including unrelated records).
export function validateMembershipChanges(previous: Member[], next: Member[]) {
  for (const row of next) {
    const existing = previous.find(old => old.id === row.id);
    if (!existing || existing.clientId !== row.clientId) {
      assertUniqueClientMembership(next, row.clientId, row.id);
    }
  }
}

export function membershipStatus(m: Pick<Member, 'start' | 'expiry'>, today: string): Member['status'] | 'Upcoming' {
  if (m.start > today) return 'Upcoming';
  if (m.expiry < today) return 'Expired';
  const days = (Date.parse(m.expiry) - Date.parse(today)) / 86400000;
  return days <= 14 ? 'Expiring' : 'Active';
}