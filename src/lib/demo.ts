import { useSyncExternalStore } from "react";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { invitationStatus } from "./validation";
import { initialState, type State, type StaffMember, type Workout } from "./store";
import { gymEvents } from './gym-events';
import { appendGymEvents } from './gym-notifications-demo';

/**
 * Prototype-only demo layer. Completely isolated from production auth and the
 * Cloud backend: demo sessions and demo data live in localStorage only and
 * never touch Supabase. No real payments, emails, or SMS are involved.
 */

export type DemoSessionKind = "super" | "owner" | "individual";
export type DemoSession = DemoSessionKind | null;

const SESSION_KEY = "ironhaus-demo-session";

export type DemoSessionInfo = {
  kind: DemoSessionKind;
  email: string;
  name?: string;
  directAccess?: boolean;
};

export function getDemoSessionInfo(): DemoSessionInfo | null {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    if (!v) return null;
    if (v === "super" || v === "owner") return { kind: v, email: "" }; // legacy hardcoded demo accounts
    const o = JSON.parse(v) as DemoSessionInfo;
    return o && (o.kind === "super" || o.kind === "owner" || o.kind === "individual") ? o : null;
  } catch {
    return null;
  }
}

export function getDemoSession(): DemoSession {
  return getDemoSessionInfo()?.kind ?? null;
}

export function setDemoSession(
  s: DemoSession,
  email = "",
  details: Pick<DemoSessionInfo, "name" | "directAccess"> = {},
) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify({ kind: s, email, ...details }));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode */
  }
}

export const DEMO_ACCOUNTS = [
  {
    session: "super" as const,
    name: "zeyad salama",
    identifier: "zeyadsalama",
    password: "zeyadsalama",
  },
  {
    session: "owner" as const,
    name: "zeyad salama1",
    identifier: "gym email",
    password: "zeyad salama1",
  },
];

/** Returns the demo session for exact demo credentials, else null. */
export function matchDemoAccount(name: string, identifier: string, password: string): DemoSession {
  const n = name.trim().toLowerCase();
  const i = identifier.trim().toLowerCase();
  const hit = DEMO_ACCOUNTS.find(
    (a) => a.name === n && a.identifier === i && a.password === password,
  );
  return hit ? hit.session : null;
}

/* ---------------- Demo account registry (prototype sign-up) ---------------- */

export type DemoAccountType = "gym" | "individual" | "dashboard";

export type DemoAccount = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  type: DemoAccountType;
  /** Gym Account chose Skip — demo access to the owner dashboard. */
  skipped: boolean;
  /** Gym Account submitted a subscription request. */
  requestPending: boolean;
};

const ACCOUNTS_KEY = "ironhaus-demo-accounts-v1";

export function getDemoAccounts(): DemoAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw) as DemoAccount[];
  } catch {
    /* corrupted storage -> empty */
  }
  return [];
}

function saveAccounts(list: DemoAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

/** Creates a demo account; returns the existing one when email+password match. */
export function registerDemoAccount(
  name: string,
  email: string,
  password: string,
  type: DemoAccountType,
  phone = '',
): DemoAccount {
  const e = email.trim().toLowerCase();
  const list = getDemoAccounts();
  const existing = list.find((a) => a.email === e);
  if (existing) {
    if (existing.password !== password)
      throw new Error("An account with this email already exists. Sign in instead.");
    return existing;
  }
  const acc: DemoAccount = {
    name: name.trim(),
    email: e,
    password,
    type,
    phone,
    skipped: false,
    requestPending: false,
  };
  saveAccounts([...list, acc]);
  return acc;
}

export function updateDemoAccount(
  email: string,
  patch: Partial<Pick<DemoAccount, "skipped" | "requestPending">>,
) {
  saveAccounts(getDemoAccounts().map((a) => (a.email === email ? { ...a, ...patch } : a)));
}

/** Finds a registered demo account by email + password. */
export function findDemoAccount(identifier: string, password: string): DemoAccount | null {
  const i = identifier.trim().toLowerCase();
  return getDemoAccounts().find((a) => a.email === i && a.password === password) ?? null;
}

/** The account behind the current demo session, or null for legacy hardcoded sessions. */
export function getDemoAccount(): DemoAccount | null {
  const info = getDemoSessionInfo();
  if (!info || !info.email || info.directAccess) return null;
  return getDemoAccounts().find((a) => a.email === info.email) ?? null;
}

export function sessionKindFor(type: DemoAccountType): DemoSessionKind {
  return type === "dashboard" ? "super" : type === "gym" ? "owner" : "individual";
}

/** Where a registered demo account lands after sign-in. */
export function demoDestination(
  acc: Pick<DemoAccount, "type" | "skipped">,
): "/super-admin" | "/member" | "/dashboard" | "/subscription-request" {
  if (acc.type === "dashboard") return "/super-admin";
  if (acc.type === "individual") return "/member";
  return acc.skipped ? "/dashboard" : "/subscription-request";
}

/* ---------------- Demo platform data (Super Admin) ---------------- */

export type GymRequest = {
  id: string;
  ownerName?: string;
  submittedAt?: string;
  gymName: string;
  phone: string;
  email: string;
  plan: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type ApprovedGym = {
  id: string;
  name: string;
  phone: string;
  email: string;
  plan: string;
  start: string;
  end: string;
  status: "Active" | "Frozen";
};

export type DemoClient = { id: string; name: string; phone: string; photo: string; gyms: string[] };

export type RevenueEvent = { id: string; date: string; amount: number; gymName: string };
export type DemoInvitation = Database["public"]["Tables"]["staff_invitations"]["Row"] & {
  gym_name?: string;
};
export const expenseSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(100),
  amount: z.number().finite().positive(),
  date: z.string().date(),
  method: z.string().max(100),
  notes: z.string().max(2000),
  receipt: z.string().max(3000000).optional(),
  receiptName: z.string().max(255).optional(),
});
export type PlatformExpense = z.infer<typeof expenseSchema>;

export type DemoState = {
  requests: GymRequest[];
  gyms: ApprovedGym[];
  clients: DemoClient[];
  revenue: RevenueEvent[];
  expenses: PlatformExpense[];
  invitations: DemoInvitation[];
  sessionClients: Record<string, string>;
  staffRoles: DemoStaffRole[];
  programs: DemoProgram[];
  assignments: DemoAssignment[];
};
export type DemoAssignment = {
  id: string;
  requestKey: string;
  gymId: string;
  gymName: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  memberId: string;
  sentAt: string;
  program: Workout;
  status: "Pending" | "Saved" | "Deleted";
};
export type DemoStaffRole = StaffMember & {
  id: string;
  userId: string;
  gymId: string;
  gymName: string;
};
export type DemoProgram = {
  id: string;
  user_id: string;
  definition: Workout;
  completion: number[];
  created_at: string;
};
export const demoUserId = (email: string) =>
  `demo-user-${email.trim().toLowerCase() || "anonymous"}`;
/** Identity registry survives sign-out and is never removed when gyms are left. */
export function demoMemberId(userId: string): string {
  const key = "ironhaus-demo-member-identities";
  let registry: Record<string, string> = {};
  try {
    registry = JSON.parse(localStorage.getItem(key) ?? "{}");
  } catch {
    /* retain a new registry */
  }
  const existing = registry[userId];
  if (existing) return existing;
  const membership = readDemoGym("demo-gym", true).members.find(
    (m) => (m.clientId ?? demoUserId(m.email)) === userId,
  );
  const candidate = membership?.memberQrId ?? userId;
  const id = Object.values(registry).includes(candidate) ? crypto.randomUUID() : candidate;
  registry[userId] = id;
  localStorage.setItem(key, JSON.stringify(registry));
  return id;
}
export type DemoMembershipHistory = {
  userId: string;
  gymId: string;
  gym: string;
  definition: State["members"][number];
};
export function readDemoMembershipHistory(userId: string): DemoMembershipHistory[] {
  try {
    return (
      JSON.parse(
        localStorage.getItem("ironhaus-demo-membership-history") ?? "[]",
      ) as DemoMembershipHistory[]
    ).filter((r) => r.userId === userId);
  } catch {
    return [];
  }
}
export function rememberDemoMemberships(gymId: string, gym: string, members: State["members"]) {
  let rows: DemoMembershipHistory[] = [];
  try {
    rows = JSON.parse(localStorage.getItem("ironhaus-demo-membership-history") ?? "[]");
  } catch {
    /* empty */
  }
  for (const m of members) {
    const userId = m.clientId ?? demoUserId(m.email);
    if (
      !rows.some(
        (r) =>
          r.userId === userId &&
          r.gymId === gymId &&
          r.definition.id === m.id &&
          r.definition.plan === m.plan &&
          r.definition.start === m.start &&
          r.definition.expiry === m.expiry,
      )
    ) {
      rows.push({ userId, gymId, gym, definition: structuredClone(m) });
    }
  }
  localStorage.setItem("ironhaus-demo-membership-history", JSON.stringify(rows));
}

export const PLAN_PRICES: Record<string, number> = { Basic: 800, Premium: 2100, VIP: 7200 };
export const PLAN_MONTHS: Record<string, number> = { Basic: 1, Premium: 3, VIP: 12 };

const seed: DemoState = {
  expenses: [],
  invitations: [],
  sessionClients: {},
  staffRoles: [],
  programs: [],
  assignments: [],
  requests: [
    {
      id: "req-1",
      gymName: "Titan Strength Club",
      phone: "+20 100 222 8871",
      email: "owner@titanstrength.com",
      plan: "Premium",
      requestDate: "2026-10-14",
      status: "Pending",
    },
    {
      id: "req-2",
      gymName: "Pulse Fitness Studio",
      phone: "+20 111 905 4432",
      email: "hello@pulsefit.com",
      plan: "Basic",
      requestDate: "2026-10-16",
      status: "Pending",
    },
    {
      id: "req-3",
      gymName: "Atlas Performance Lab",
      phone: "+20 122 480 1190",
      email: "info@atlasperf.com",
      plan: "VIP",
      requestDate: "2026-10-17",
      status: "Pending",
    },
  ],
  gyms: [
    {
      id: "gym-1",
      name: "IRONHAUS Performance Club",
      phone: "+20 100 555 0192",
      email: "owner@ironhaus.gym",
      plan: "VIP",
      start: "2026-01-01",
      end: "2026-12-31",
      status: "Active",
    },
    {
      id: "gym-2",
      name: "IRONHAUS North",
      phone: "+20 100 555 7741",
      email: "north@ironhaus.gym",
      plan: "Premium",
      start: "2026-06-01",
      end: "2026-08-31",
      status: "Active",
    },
    {
      id: "gym-3",
      name: "IronWorks Downtown",
      phone: "+20 101 730 2284",
      email: "contact@ironworks.fit",
      plan: "Basic",
      start: "2026-09-15",
      end: "2026-10-15",
      status: "Frozen",
    },
    {
      id: "gym-4",
      name: "Vertex Athletic Club",
      phone: "+20 112 664 9023",
      email: "team@vertexclub.com",
      plan: "Premium",
      start: "2026-03-10",
      end: "2026-06-10",
      status: "Active",
    },
  ],
  clients: [
    {
      id: "cli-1",
      name: "Omar Khaled",
      phone: "+20 103 400 1337",
      photo: "",
      gyms: ["IRONHAUS Performance Club"],
    },
    {
      id: "cli-2",
      name: "Layla Hassan",
      phone: "+20 100 414 1674",
      photo: "",
      gyms: ["IRONHAUS Performance Club", "Vertex Athletic Club"],
    },
    {
      id: "cli-3",
      name: "Youssef Adel",
      phone: "+20 101 428 2011",
      photo: "",
      gyms: ["IRONHAUS North"],
    },
    {
      id: "cli-4",
      name: "Mariam Fathy",
      phone: "+20 102 442 2348",
      photo: "",
      gyms: ["IRONHAUS Performance Club", "IRONHAUS North"],
    },
    {
      id: "cli-5",
      name: "Karim Nabil",
      phone: "+20 103 456 2685",
      photo: "",
      gyms: ["Vertex Athletic Club"],
    },
    {
      id: "cli-6",
      name: "Salma Tarek",
      phone: "+20 106 484 3359",
      photo: "",
      gyms: ["IRONHAUS Performance Club"],
    },
  ],
  revenue: [
    { id: "rev-1", date: "2026-01-01", amount: 7200, gymName: "IRONHAUS Performance Club" },
    { id: "rev-2", date: "2026-03-10", amount: 2100, gymName: "Vertex Athletic Club" },
    { id: "rev-3", date: "2026-06-01", amount: 2100, gymName: "IRONHAUS North" },
    { id: "rev-4", date: "2026-09-15", amount: 800, gymName: "IronWorks Downtown" },
    { id: "rev-5", date: "2026-10-02", amount: 2100, gymName: "Vertex Athletic Club" },
    { id: "rev-6", date: "2026-10-11", amount: 800, gymName: "IRONHAUS North" },
  ],
};

const DATA_KEY = "ironhaus-demo-data-v1";
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) return { ...structuredClone(seed), ...JSON.parse(raw) } as DemoState;
  } catch {
    /* corrupted or unavailable storage -> reseed */
  }
  return structuredClone(seed);
}

let demoState: DemoState = load();

function commit(next: DemoState) {
  demoState = next;
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(next));
  } catch {
    /* storage full/unavailable: keep in-memory */
  }
  listeners.forEach((l) => l());
}

export function useDemoStore<T>(sel: (s: DemoState) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(demoState),
    () => sel(demoState),
  );
}

export function getDemoState() {
  return demoState;
}

export function submitDemoGymRequest(gymName: string, plan: string) {
  const s = getDemoSessionInfo();
  if (s?.kind !== 'owner') throw new Error('Gym owner account required');
  const name = z.string().trim().min(1).max(100).parse(gymName);
  const selected = z.enum(['Monthly Plan','3 Months Plan','Annual Plan']).parse(plan);
  const existing = demoState.requests.find(r => r.email === s.email && r.status === 'Pending' && r.submittedAt);
  if (existing) return existing;
  const now = new Date().toISOString();
  const row: GymRequest = {id:crypto.randomUUID(),gymName:name,ownerName:s.name || getDemoAccount()?.name || 'Name not recorded',email:s.email,phone:'',plan:selected,requestDate:now.slice(0,10),submittedAt:now,status:'Pending'};
  commit({...demoState,requests:[row,...demoState.requests]});
  return row;
}

export function selectSessionClient(gymId: string, memberId: string) {
  commit({ ...demoState, sessionClients: { ...demoState.sessionClients, [gymId]: memberId } });
}

export function savePlatformExpense(expense: PlatformExpense) {
  const row = expenseSchema.parse(expense);
  commit({
    ...demoState,
    expenses: demoState.expenses.some((e) => e.id === row.id)
      ? demoState.expenses.map((e) => (e.id === row.id ? row : e))
      : [row, ...demoState.expenses],
  });
}
export function deletePlatformExpense(id: string) {
  commit({ ...demoState, expenses: demoState.expenses.filter((e) => e.id !== id) });
}
export function filterExpenses(
  rows: PlatformExpense[],
  search: string,
  category: string,
  from: string,
  to: string,
) {
  return rows.filter(
    (e) =>
      (!search || `${e.name} ${e.notes}`.toLowerCase().includes(search.toLowerCase())) &&
      (!category || e.category === category) &&
      (!from || e.date >= from) &&
      (!to || e.date <= to),
  );
}
export function platformTotals(
  revenue: RevenueEvent[],
  expenses: PlatformExpense[],
  from: Date,
  to: Date,
) {
  const income = revenue
    .filter((r) => inRange(r.date, from, to))
    .reduce((sum, r) => sum + r.amount, 0);
  const spent = expenses
    .filter((e) => inRange(e.date, from, to))
    .reduce((sum, e) => sum + e.amount, 0);
  return { revenue: income, expenses: spent, net: income - spent };
}

export function createDemoInvitation(
  gymId: string,
  gymName: string,
  name: string,
  email: string,
  role: "Admin" | "Reception" | "Trainer",
) {
  const normalized = z.string().trim().email().max(255).parse(email).toLowerCase();
  const fullName = z.string().trim().min(1).max(100).parse(name);
  if (
    demoState.invitations.some(
      (i) =>
        i.gym_id === gymId &&
        i.email === normalized &&
        i.role === role &&
        invitationStatus(i.status, i.expires_at) === "Pending",
    )
  )
    throw new Error(
      "An active invitation already exists for this email and role. Resend it from Invitations.",
    );
  const row: DemoInvitation = {
    id: uid(),
    gym_id: gymId,
    gym_name: gymName,
    full_name: fullName,
    email: normalized,
    role,
    status: "Pending",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    accepted_by: null,
    permissions:
      role === "Admin"
        ? ["Members", "Attendance", "Sessions", "Payments", "Finance", "Workout programs"]
        : role === "Reception"
          ? ["Members", "Attendance", "Sessions", "Payments"]
          : ["Members", "Workout programs"],
  };
  commit({ ...demoState, invitations: [row, ...demoState.invitations] });
  return row;
}
export function changeDemoInvitation(gymId: string, id: string, action: "resend" | "cancel") {
  const row = demoState.invitations.find((i) => i.id === id && i.gym_id === gymId);
  if (!row || !["Pending", "Expired"].includes(invitationStatus(row.status, row.expires_at)))
    throw new Error("Invitation unavailable");
  if (action === "cancel" && invitationStatus(row.status, row.expires_at) !== "Pending")
    throw new Error("Only pending invitations can be cancelled");
  commit({
    ...demoState,
    invitations: demoState.invitations.map((i) =>
      i.id === id && i.gym_id === gymId
        ? {
            ...i,
            ...(action === "cancel"
              ? { status: "Cancelled" }
              : {
                  status: "Pending",
                  created_at: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
                }),
          }
        : i,
    ),
  });
}

export function pendingDemoInvitations(email: string, rows = demoState.invitations) {
  const normalized = email.trim().toLowerCase();
  return normalized
    ? rows.filter(
        (i) =>
          i.email.toLowerCase() === normalized &&
          invitationStatus(i.status, i.expires_at) === "Pending",
      )
    : [];
}
export function respondDemoInvitation(id: string, accept: boolean) {
  const info = getDemoSessionInfo();
  if (!info || info.kind !== "individual") throw new Error("Open your member account to respond");
  const row = pendingDemoInvitations(info.email).find((i) => i.id === id);
  if (!row) throw new Error("Invitation unavailable for this account");
  const userId = demoUserId(info.email);
  const role: DemoStaffRole = {
    id: row.id,
    userId,
    gymId: row.gym_id,
    gymName: row.gym_name ?? "Gym",
    name: info.name || row.full_name,
    email: row.email,
    role: row.role,
    permissions: [...row.permissions],
  };
  commit({
    ...demoState,
    invitations: demoState.invitations.map((i) =>
      i.id === id
        ? { ...i, status: accept ? "Accepted" : "Declined", accepted_by: accept ? userId : null }
        : i,
    ),
    staffRoles: accept
      ? [
          ...demoState.staffRoles.filter((r) => !(r.gymId === row.gym_id && r.userId === userId)),
          role,
        ]
      : demoState.staffRoles,
  });
  appendGymEvents(row.gym_id, [{ id: `invitation-response:${id}`, type: 'Staff invitation', description: `${row.full_name} · Invitation ${accept ? 'accepted' : 'declined'} (${row.role})`, page: '/staff', createdAt: new Date().toISOString() }]);
}

export function readDemoGym(gymId: string, withSeed = false): State {
  let stored: State | undefined;
  try {
    const raw =
      localStorage.getItem(`ironhaus-demo-gym:${gymId}`) ??
      (gymId === "demo-gym" ? localStorage.getItem("ironhaus-demo-gym-state") : null);
    if (raw) stored = JSON.parse(raw) as State;
  } catch {
    /* Use an empty gym or the owner seed. */
  }
  const base =
    stored ??
    (withSeed && gymId === "demo-gym"
      ? structuredClone(initialState)
      : {
          ...structuredClone(initialState),
          members: [],
          plans: [],
          products: [],
          trainers: [],
          workouts: [],
          staff: [],
          sessions: [],
          attendance: [],
          staffAttendance: [],
          recurring: [],
          transactions: [],
        });
  const local = base.staff.map((s) => ({
    ...s,
    id: s.id ?? `seed:${s.email}`,
    userId: s.userId ?? demoUserId(s.email),
  }));
  const associations = demoState.staffRoles.filter((r) => r.gymId === gymId);
  return {
    ...base,
    transactions:
      base.transactions ??
      (withSeed && gymId === "demo-gym" ? structuredClone(initialState.transactions) : []),
    staff: [
      ...local.filter((s) => !associations.some((r) => r.userId === s.userId)),
      ...associations,
    ],
  };
}
export function writeDemoGym(gymId: string, state: State) {
  const previous = readDemoGym(gymId, gymId === "demo-gym");
  rememberDemoMemberships(gymId, previous.gym.name, previous.members);
  rememberDemoMemberships(gymId, state.gym.name, state.members);
  localStorage.setItem(`ironhaus-demo-gym:${gymId}`, JSON.stringify(state));
  if (gymId === "demo-gym") localStorage.setItem("ironhaus-demo-gym-state", JSON.stringify(state));
  appendGymEvents(gymId, gymEvents(previous, state));
}
export function changeDemoStaff(
  gymId: string,
  id: string,
  patch: Partial<Pick<StaffMember, "name" | "phone" | "role" | "permissions">> | null,
) {
  if (getDemoSession() !== "owner") throw new Error("Only gym owners can manage staff");
  const state = readDemoGym(gymId, true);
  const row = state.staff.find((s) => s.id === id);
  if (!row || row.role === "Owner") throw new Error("Staff member unavailable");
  writeDemoGym(gymId, {
    ...state,
    staff: patch
      ? state.staff.map((s) => (s.id === id ? { ...s, ...patch } : s))
      : state.staff.filter((s) => s.id !== id),
  });
  commit({
    ...demoState,
    staffRoles: patch
      ? demoState.staffRoles.map((r) => (r.gymId === gymId && r.id === id ? { ...r, ...patch } : r))
      : demoState.staffRoles.filter((r) => !(r.gymId === gymId && r.id === id)),
  });
}
export function saveDemoProgram(userId: string, definition: Workout, id?: string) {
  if (getDemoSession() !== "individual" || demoUserId(getDemoSessionInfo()?.email ?? "") !== userId)
    throw new Error("Your own programs only");
  const row: DemoProgram = {
    id: id ?? uid(),
    user_id: userId,
    definition: structuredClone(definition),
    completion: [],
    created_at: new Date().toISOString(),
  };
  if (id && !demoState.programs.some((p) => p.id === id && p.user_id === userId))
    throw new Error("Program unavailable");
  commit({
    ...demoState,
    programs: id
      ? demoState.programs.map((p) => (p.id === id && p.user_id === userId ? row : p))
      : [row, ...demoState.programs],
  });
}
export function changeDemoProgram(id: string, completion: number[] | null) {
  const userId = demoUserId(getDemoSessionInfo()?.email ?? "");
  const row = demoState.programs.find((p) => p.id === id && p.user_id === userId);
  if (getDemoSession() !== "individual" || !row) throw new Error("Program unavailable");
  commit({
    ...demoState,
    programs:
      completion === null
        ? demoState.programs.filter((p) => p.id !== id)
        : demoState.programs.map((p) => (p.id === id ? { ...p, completion } : p)),
  });
}

const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const today = () => new Date().toISOString().slice(0, 10);

function addMonths(iso: string, months: number) {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function approveRequest(id: string) {
  const req = demoState.requests.find((r) => r.id === id);
  if (!req || req.status !== "Pending") return;
  const start = today();
  const gym: ApprovedGym = {
    id: uid(),
    name: req.gymName,
    phone: req.phone,
    email: req.email,
    plan: req.plan,
    start,
    end: addMonths(start, PLAN_MONTHS[req.plan] ?? 1),
    status: "Active",
  };
  commit({
    ...demoState,
    requests: demoState.requests.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)),
    gyms: [gym, ...demoState.gyms],
    revenue: [
      { id: uid(), date: start, amount: PLAN_PRICES[req.plan] ?? 0, gymName: req.gymName },
      ...demoState.revenue,
    ],
  });
}

export function rejectRequest(id: string) {
  commit({
    ...demoState,
    requests: demoState.requests.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)),
  });
}

export function editGym(id: string, patch: { name: string; plan: string }) {
  commit({
    ...demoState,
    gyms: demoState.gyms.map((g) =>
      g.id === id
        ? {
            ...g,
            name: patch.name,
            plan: patch.plan,
            end: addMonths(g.start, PLAN_MONTHS[patch.plan] ?? 1),
          }
        : g,
    ),
  });
}

export function setGymStatus(id: string, status: "Active" | "Frozen") {
  commit({ ...demoState, gyms: demoState.gyms.map((g) => (g.id === id ? { ...g, status } : g)) });
}

export function deleteGym(id: string) {
  commit({ ...demoState, gyms: demoState.gyms.filter((g) => g.id !== id) });
}

export function editClient(id: string, patch: { name: string; phone: string }) {
  commit({
    ...demoState,
    clients: demoState.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  });
}

/** Removes one gym membership; the client and their other gyms stay. */
export function removeClientGym(clientId: string, gymName: string) {
  commit({
    ...demoState,
    clients: demoState.clients.map((c) =>
      c.id === clientId ? { ...c, gyms: c.gyms.filter((g) => g !== gymName) } : c,
    ),
  });
}

export function deleteClient(id: string) {
  commit({ ...demoState, clients: demoState.clients.filter((c) => c.id !== id) });
}

/* ---------------- Period filtering ---------------- */

export type Period =
  "today" | "yesterday" | "7d" | "month" | "lastMonth" | "year" | "lastYear" | "custom";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 Days" },
  { id: "month", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "year", label: "This Year" },
  { id: "lastYear", label: "Last Year" },
  { id: "custom", label: "Custom Range" },
];

export function periodRange(
  p: Period,
  custom?: { from: string; to: string },
): { from: Date; to: Date } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  switch (p) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "7d": {
      const f = new Date(now);
      f.setDate(f.getDate() - 6);
      return { from: startOfDay(f), to: endOfDay(now) };
    }
    case "month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case "lastMonth":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
      };
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
    case "lastYear":
      return {
        from: new Date(now.getFullYear() - 1, 0, 1),
        to: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
      };
    case "custom": {
      const from = custom?.from ? new Date(custom.from + "T00:00:00") : startOfDay(now);
      const to = custom?.to ? new Date(custom.to + "T23:59:59") : endOfDay(now);
      return { from, to };
    }
  }
}

export function inRange(iso: string, from: Date, to: Date) {
  const t = new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

/** Owners, or trainers/admins of this gym, may send workouts to that gym's own members only. */
export function sendDemoAssignment(input: {
  requestKey: string;
  gymId: string;
  gymName: string;
  memberId: string;
  program: Workout;
}) {
  const info = getDemoSessionInfo();
  if (!info) throw new Error("Sign in first");
  const senderId = demoUserId(info.email);
  const staff = demoState.staffRoles.find((r) => r.gymId === input.gymId && r.userId === senderId);
  const allowed =
    info.kind === "owner" ||
    (info.kind === "individual" && !!staff && ["Trainer", "Admin", "Owner"].includes(staff.role));
  if (!allowed) throw new Error("Only this gym's trainers or owner can send workouts");
  const existing = demoState.assignments.find((a) => a.requestKey === input.requestKey);
  if (existing) return existing;
  const member = readDemoGym(input.gymId, input.gymId === "demo-gym").members.find(
    (m) => m.id === input.memberId,
  );
  if (!member) throw new Error("This client is not a member of the current gym");
  const row: DemoAssignment = {
    id: uid(),
    requestKey: input.requestKey,
    gymId: input.gymId,
    gymName: input.gymName,
    senderId,
    senderName: staff?.name || info.name || getDemoAccount()?.name || "Gym Owner",
    recipientId: member.clientId ?? demoUserId(member.email),
    recipientName: member.name,
    memberId: member.id,
    sentAt: new Date().toISOString(),
    program: structuredClone({
      ...input.program,
      trainer: staff?.name || info.name || "Gym Owner",
    }),
    status: "Pending",
  };
  commit({ ...demoState, assignments: [row, ...demoState.assignments] });
  return row;
}
export function pendingDemoAssignments(userId: string, rows = demoState.assignments) {
  return rows.filter((a) => a.recipientId === userId && a.status === "Pending");
}
/** Save copies the snapshot into the recipient's own programs; Delete only dismisses the notification. */
export function respondDemoAssignment(id: string, save: boolean) {
  if (getDemoSession() !== "individual") throw new Error("Open your client account to respond");
  const userId = demoUserId(getDemoSessionInfo()?.email ?? "");
  const row = demoState.assignments.find((a) => a.id === id && a.recipientId === userId);
  if (!row || row.status !== "Pending") throw new Error("Workout unavailable");
  const copy: DemoProgram | null = save
    ? {
        id: uid(),
        user_id: userId,
        definition: { ...structuredClone(row.program), id: crypto.randomUUID() },
        completion: [],
        created_at: new Date().toISOString(),
      }
    : null;
  commit({
    ...demoState,
    assignments: demoState.assignments.map((a) =>
      a.id === id ? { ...a, status: save ? "Saved" : "Deleted" } : a,
    ),
    programs: copy ? [copy, ...demoState.programs] : demoState.programs,
  });
}
