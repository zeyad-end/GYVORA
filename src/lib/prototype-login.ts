import { setDemoSession, sessionKindFor, type DemoAccountType } from "@/lib/demo";

export type PrototypeLoginDetails = { destination: DemoAccountType; name: string; email: string };
const PREFERENCE_KEY = "ironhaus-prototype-login-preference";

export function prototypeDestination(destination: DemoAccountType): "/dashboard" | "/member" | "/super-admin" {
  return destination === "gym" ? "/dashboard" : destination === "individual" ? "/member" : "/super-admin";
}

/** Display preferences only; never persist passwords or create accounts. */
export function savePrototypePreference(details: PrototypeLoginDetails, remember: boolean) {
  try {
    if (remember) localStorage.setItem(PREFERENCE_KEY, JSON.stringify(details));
    else localStorage.removeItem(PREFERENCE_KEY);
  } catch { /* Storage may be unavailable. */ }
}

export function getPrototypePreference(): PrototypeLoginDetails | null {
  try {
    const raw = localStorage.getItem(PREFERENCE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!["gym", "individual", "dashboard"].includes(value?.destination) || typeof value.name !== "string" || typeof value.email !== "string") return null;
    return { destination: value.destination, name: value.name, email: value.email };
  } catch { return null; }
}

/** Selected destination is authoritative, independent of old accounts or credentials. */
export function enterPrototype(details: PrototypeLoginDetails, remember: boolean) {
  savePrototypePreference(details, remember);
  setDemoSession(sessionKindFor(details.destination), details.email, { name: details.name, directAccess: true });
  return prototypeDestination(details.destination);
}