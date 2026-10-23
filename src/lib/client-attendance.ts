import type { AttendanceEvent, Member } from "./store";
import { generateId } from "./utils";
export function recordClientVisit(
  rows: AttendanceEvent[],
  member: Member,
  method: "QR" | "Manual",
  now = new Date(),
): AttendanceEvent[] {
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (rows.some((r) => r.memberId === member.id && r.date === date))
    throw new Error("Already checked in today");
  return [
    {
      id: generateId(),
      name: member.name,
      memberId: member.id,
      date,
      time: now.toTimeString().slice(0, 5),
      method,
    },
    ...rows,
  ];
}
