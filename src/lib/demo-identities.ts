import { generateId } from './utils';
import { isGyvoraId } from './gyvora-id';

const storageKey = 'gyvora-demo-permanent-identities-v1';
type Entry = { kind: 'G' | 'C'; localId: string; key: string; id?: string };
type Registry = { installation: string; entries: Entry[] };
function read(): Registry {
  const raw = localStorage.getItem(storageKey);
  if (raw) return JSON.parse(raw) as Registry;
  const registry = { installation: generateId(), entries: [] };
  localStorage.setItem(storageKey, JSON.stringify(registry));
  return registry;
}
export function ensureDemoIdentity(kind: Entry['kind'], localId: string): string | undefined {
  const registry = read();
  const found = registry.entries.find(e => e.kind === kind && e.localId === localId);
  if (found) return found.id;
  registry.entries.push({ kind, localId, key: generateId() });
  localStorage.setItem(storageKey, JSON.stringify(registry));
  return undefined;
}
export function demoIdentity(kind: Entry['kind'], localId: string): string | undefined {
  return read().entries.find(e => e.kind === kind && e.localId === localId)?.id;
}
export async function syncDemoIdentities(reserve: (input: { data: { installation: string; identities: { kind: 'G' | 'C'; key: string }[] } }) => Promise<{kind:'G'|'C';key:string;id:string}[]>) {
  const registry = read();
  const pending = registry.entries.filter(e => !e.id);
  for (let offset = 0; offset < pending.length; offset += 200) {
    const rows = await reserve({ data: { installation: registry.installation, identities: pending.slice(offset, offset + 200).map(({kind,key}) => ({kind,key})) } });
    const current = read();
    for (const row of rows) {
      const entry = current.entries.find(e => e.kind === row.kind && e.key === row.key);
      if (!entry || !isGyvoraId(row.id) || !row.id.startsWith(`GYVORA-${entry.kind}-`)) throw new Error('Invalid permanent identity');
      if (entry.id && entry.id !== row.id) throw new Error('Permanent identity cannot change');
      entry.id = row.id;
    }
    localStorage.setItem(storageKey, JSON.stringify(current));
  }
}