import type { AttendanceEvent } from './store';
export function editAttendanceRecord(rows: AttendanceEvent[], id: string, patch: Pick<AttendanceEvent, 'name' | 'date' | 'time' | 'staffId' | 'role'> | null): AttendanceEvent[] {
  if (!rows.some(r => r.id === id)) throw new Error('Attendance record no longer exists');
  if (!patch) return rows.filter(r => r.id !== id);
  if (!patch.name.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(patch.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(patch.time)) throw new Error('Enter an employee, date and valid time');
  return rows.map(r => r.id === id ? { ...r, ...patch, name: patch.name.trim() } : r);
}