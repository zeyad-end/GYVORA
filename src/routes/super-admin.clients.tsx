import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader, DataTable, td, Avatar, Field } from '@/components/kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { initials } from '@/lib/mock';
import { useDemoStore, editClient, deleteClient, removeClientGym, type DemoClient } from '@/lib/demo';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/super-admin/clients')({
  head: () => seo('Clients', 'Fictional client accounts across platform gyms.'),
  component: Clients,
});

function Clients() {
  const clients = useDemoStore((s) => s.clients);
  const [editing, setEditing] = useState<DemoClient | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function openEdit(c: DemoClient) {
    setEditing(c);
    setName(c.name);
    setPhone(c.phone);
  }

  function saveEdit() {
    if (!editing) return;
    if (!name.trim()) {
      toast.error('Client name is required');
      return;
    }
    editClient(editing.id, { name: name.trim(), phone: phone.trim() });
    toast.success('Client updated (demo).');
    setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Clients" subtitle="Fictional client accounts · a client can belong to multiple gyms." />
      <DataTable head={['Client', 'Phone', 'Gyms', 'Actions']}>
        {clients.map((c) => (
          <tr key={c.id}>
            <td className={td}>
              <div className="flex items-center gap-3">
                {c.photo ? <img src={c.photo} alt="" className="h-10 w-10 rounded-full object-cover" /> : <Avatar initials={initials(c.name)} />}
                <span className="font-medium">{c.name}</span>
              </div>
            </td>
            <td className={td}>{c.phone}</td>
            <td className={td}>
              <div className="flex flex-wrap gap-1.5">
                {c.gyms.map((g) => (
                  <span key={g} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs">
                    {g}
                    <button aria-label={`Remove ${c.name} from ${g}`} className="text-muted-foreground hover:text-destructive"
                      onClick={() => { removeClientGym(c.id, g); toast.success(`${c.name} removed from ${g} (demo). Other memberships kept.`); }}>×</button>
                  </span>
                ))}
                {!c.gyms.length && <span className="text-xs text-muted-foreground">No gyms</span>}
              </div>
            </td>
            <td className={td}>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => { if (window.confirm(`Delete ${c.name} entirely? This removes all their demo gym memberships.`)) { deleteClient(c.id); toast.success(`${c.name} deleted (demo).`); } }}>Delete</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      {!clients.length && <p className="py-6 text-muted-foreground">No clients.</p>}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="dialog" aria-modal="true" aria-label="Edit client">
          <div className="panel w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold">Edit client</h3>
            <div className="mt-4 space-y-4">
              <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></Field>
              <Field label="Phone number"><Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} /></Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
