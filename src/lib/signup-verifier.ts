/** Build-time DEV plus server runtime guard: neither request origin nor client flags can enable this. */
export function temporaryVerificationEnabled(developmentBuild: boolean, runtimeMode: string | undefined) {
  return developmentBuild && runtimeMode !== 'production';
}
export function normalizeContact(channel: 'email' | 'phone', value: string) {
  const contact = value.trim();
  if (channel === 'email') return contact.toLowerCase();
  const normalized = contact.replace(/[\s()-]/g, '');
  if (!/^\+[1-9]\d{6,14}$/.test(normalized)) throw new Error('Use a phone number with country code, such as +20…');
  return normalized;
}
export function verifyTemporaryCode(code: string, enabled: boolean) {
  if (!enabled) throw new Error('Code delivery and verification are not configured. Account creation is unavailable until a verification provider is connected.');
  if (!code.trim()) throw new Error('Enter the verification code.');
}
export function matchesAccountType(selected: 'gym' | 'individual' | 'dashboard', type: string, admin: boolean) {
  return selected === 'dashboard' ? admin : !admin && type === (selected === 'gym' ? 'owner' : 'client');
}