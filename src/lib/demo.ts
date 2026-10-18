import { useSyncExternalStore } from "react";

/**
 * Prototype-only demo layer. Completely isolated from production auth and the
 * Cloud backend: demo sessions and demo data live in localStorage only and
 * never touch Supabase. No real payments, emails, or SMS are involved.
 */

export type DemoSession = "super" | "owner" | null;

const SESSION_KEY = "ironhaus-demo-session";

export function getDemoSession(): DemoSession {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    return v === "super" || v === "owner" ? v : null;
  } catch {
    return null;
  }
}

export function setDemoSession(s: DemoSession) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, s);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode */
  }
}

export const DEMO_ACCOUNTS = [
  { session: "super" as const, name: "zeyad salama", identifier: "zeyadsalama", password: "zeyadsalama" },
  { session: "owner" as const, name: "zeyad salama1", identifier: "gym email", password: "zeyad salama1" },
];

/** Returns the demo session for exact demo credentials, else null. */
export function matchDemoAccount(name: string, identifier: string, password: string): DemoSession {
  const n = name.trim().toLowerCase();
  const i = identifier.trim().toLowerCase();
  const hit = DEMO_ACCOUNTS.find((a) => a.name === n && a.identifier === i && a.password === password);
  return hit ? hit.session : null;
}

/* ---------------- Demo platform data (Super Admin) ---------------- */

export type GymRequest = {
  id: string;
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

export type DemoState = {
  requests: GymRequest[];
  gyms: ApprovedGym[];
  clients: DemoClient[];
  revenue: RevenueEvent[];
};

export const PLAN_PRICES: Record<string, number> = { Basic: 800, Premium: 2100, VIP: 7200 };
export const PLAN_MONTHS: Record<string, number> = { Basic: 1, Premium: 3, VIP: 12 };

const seed: DemoState = {
  requests: [
    { id: "req-1", gymName: "Titan Strength Club", phone: "+20 100 222 8871", email: "owner@titanstrength.com", plan: "Premium", requestDate: "2026-10-14", status: "Pending" },
    { id: "req-2", gymName: "Pulse Fitness Studio", phone: "+20 111 905 4432", email: "hello@pulsefit.com", plan: "Basic", requestDate: "2026-10-16", status: "Pending" },
    { id: "req-3", gymName: "Atlas Performance Lab", phone: "+20 122 480 1190", email: "info@atlasperf.com", plan: "VIP", requestDate: "2026-10-17", status: "Pending" },
  ],
  gyms: [
    { id: "gym-1", name: "IRONHAUS Performance Club", phone: "+20 100 555 0192", email: "owner@ironhaus.gym", plan: "VIP", start: "2026-01-01", end: "2026-12-31", status: "Active" },
    { id: "gym-2", name: "IRONHAUS North", phone: "+20 100 555 7741", email: "north@ironhaus.gym", plan: "Premium", start: "2026-06-01", end: "2026-08-31", status: "Active" },
    { id: "gym-3", name: "IronWorks Downtown", phone: "+20 101 730 2284", email: "contact@ironworks.fit", plan: "Basic", start: "2026-09-15", end: "2026-10-15", status: "Frozen" },
    { id: "gym-4", name: "Vertex Athletic Club", phone: "+20 112 664 9023", email: "team@vertexclub.com", plan: "Premium", start: "2026-03-10", end: "2026-06-10", status: "Active" },
  ],
  clients: [
    { id: "cli-1", name: "Omar Khaled", phone: "+20 103 400 1337", photo: "", gyms: ["IRONHAUS Performance Club"] },
    { id: "cli-2", name: "Layla Hassan", phone: "+20 100 414 1674", photo: "", gyms: ["IRONHAUS Performance Club", "Vertex Athletic Club"] },
    { id: "cli-3", name: "Youssef Adel", phone: "+20 101 428 2011", photo: "", gyms: ["IRONHAUS North"] },
    { id: "cli-4", name: "Mariam Fathy", phone: "+20 102 442 2348", photo: "", gyms: ["IRONHAUS Performance Club", "IRONHAUS North"] },
    { id: "cli-5", name: "Karim Nabil", phone: "+20 103 456 2685", photo: "", gyms: ["Vertex Athletic Club"] },
    { id: "cli-6", name: "Salma Tarek", phone: "+20 106 484 3359", photo: "", gyms: ["IRONHAUS Performance Club"] },
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
    if (raw) return JSON.parse(raw) as DemoState;
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

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
    revenue: [{ id: uid(), date: start, amount: PLAN_PRICES[req.plan] ?? 0, gymName: req.gymName }, ...demoState.revenue],
  });
}

export function rejectRequest(id: string) {
  commit({ ...demoState, requests: demoState.requests.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)) });
}

export function editGym(id: string, patch: { name: string; plan: string }) {
  commit({
    ...demoState,
    gyms: demoState.gyms.map((g) =>
      g.id === id ? { ...g, name: patch.name, plan: patch.plan, end: addMonths(g.start, PLAN_MONTHS[patch.plan] ?? 1) } : g,
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
  commit({ ...demoState, clients: demoState.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
}

/** Removes one gym membership; the client and their other gyms stay. */
export function removeClientGym(clientId: string, gymName: string) {
  commit({
    ...demoState,
    clients: demoState.clients.map((c) => (c.id === clientId ? { ...c, gyms: c.gyms.filter((g) => g !== gymName) } : c)),
  });
}

export function deleteClient(id: string) {
  commit({ ...demoState, clients: demoState.clients.filter((c) => c.id !== id) });
}

/* ---------------- Period filtering ---------------- */

export type Period = "today" | "yesterday" | "7d" | "month" | "lastMonth" | "year" | "lastYear" | "custom";

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

export function periodRange(p: Period, custom?: { from: string; to: string }): { from: Date; to: Date } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
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
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999) };
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
    case "lastYear":
      return { from: new Date(now.getFullYear() - 1, 0, 1), to: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999) };
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
