/** One-hour pending-approval trial helpers. Times come from the server (owner_gate_state), never the client clock alone. */
export const TRIAL_MS = 60 * 60 * 1000;

export type OwnerGate = {
  gymId: string | null;
  frozen: boolean;
  freezeNote: string;
  requestStatus: string | null;
  plan: string | null;
  gymName: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  now: string;
};

/** Milliseconds of trial left, using the server-provided end and current times. */
export function trialRemainingMs(gate: Pick<OwnerGate, 'trialEndsAt' | 'now'>, at?: number): number {
  if (!gate.trialEndsAt) return 0;
  const end = new Date(gate.trialEndsAt).getTime();
  const serverNow = new Date(gate.now).getTime();
  const base = at === undefined ? Date.now() : at;
  // Anchor the client clock to the server time returned with the gate so refreshes cannot extend the trial.
  const elapsed = at === undefined ? base - serverNow : at - serverNow;
  return Math.max(0, end - serverNow - Math.max(0, elapsed));
}

/** True while a pending request has a started, unexpired trial. */
export function trialActive(gate: Pick<OwnerGate, 'requestStatus' | 'trialStartedAt' | 'trialEndsAt' | 'now'>): boolean {
  return gate.requestStatus === 'Pending' && !!gate.trialStartedAt && trialRemainingMs(gate) > 0;
}

/** True when a pending request's trial has run out (or was never started after expiring). */
export function trialExpired(gate: Pick<OwnerGate, 'requestStatus' | 'trialStartedAt' | 'trialEndsAt' | 'now'>): boolean {
  return gate.requestStatus === 'Pending' && !!gate.trialStartedAt && trialRemainingMs(gate) <= 0;
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
