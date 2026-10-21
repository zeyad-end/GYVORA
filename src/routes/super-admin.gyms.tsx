import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader, DataTable, td } from '@/components/kit';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDemoStore, setGymStatus, deleteGym, type ApprovedGym } from '@/lib/demo';
import { seo } from '@/lib/seo';
import { gymPrices } from '@/lib/platform-subscriptions';
import { egp } from '@/lib/mock';
import { StickyNote } from 'lucide-react';
import { PlatformGymEdit } from '@/components/PlatformGymEdit';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const Route = createFileRoute('/super-admin/gyms')({
  head: () => seo('Approved gyms', 'Manage fictional approved gyms and their subscriptions.'),
  component: Gyms,
});

function Gyms() {
  const gyms = useDemoStore((s) => s.gyms);
  const [editing, setEditing] = useState<ApprovedGym | null>(null);
  const [noteGymId,setNoteGymId]=useState<string|null>(null);
  const noteGym=gyms.find(g=>g.id===noteGymId&&g.notes?.trim());

  return (
    <div>
      <PageHeader title="Approved Gyms" subtitle={`Total approved gyms: ${gyms.length} · fictional demo data.`} />
      <DataTable head={['#', 'Gym Name', 'Phone', 'Email', 'Plan', 'Monthly price', 'Annual price', 'Start', 'End', 'Status', 'Notes', 'Actions']}>
        {gyms.map((g, index) => (
          <tr key={g.id}>
            <td className={td}>{index + 1}</td>
            <td className={td}>{g.name}</td>
            <td className={td}>{g.phone}</td>
            <td className={td}>{g.email}</td>
            <td className={td}>{g.plan}</td>
            <td className={td}>{egp(gymPrices(g).monthlyPrice)}</td>
            <td className={td}>{egp(gymPrices(g).annualPrice)}</td>
            <td className={td}>{g.start}</td>
            <td className={td}>{g.end}</td>
            <td className={td}><span className={g.status==='Active'?'text-success':'text-muted-foreground'}>{g.status}</span></td>
            <td className={td}>{g.notes?.trim()?<Button variant="ghost" size="icon" aria-label={`Notes for ${g.name}`} title={`Notes for ${g.name}`} onClick={()=>setNoteGymId(g.id)}><StickyNote className="h-4 w-4"/></Button>:'—'}</td>
            <td className={td}>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(g)}>Edit</Button>
                {g.status === 'Active' ? (
                  <Button size="sm" variant="secondary" onClick={() => { setGymStatus(g.id, 'Frozen'); toast.success(`${g.name} frozen (demo).`); }}>Freeze</Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => { setGymStatus(g.id, 'Active'); toast.success(`${g.name} reactivated (demo).`); }}>Reactivate</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => { if (window.confirm(`Delete ${g.name}? This removes the demo gym only.`)) { deleteGym(g.id); toast.success(`${g.name} deleted (demo).`); } }}>Delete</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
      {!gyms.length && <p className="py-6 text-muted-foreground">No approved gyms yet. Approve a request to add one.</p>}

      {editing&&<PlatformGymEdit key={editing.id} gym={editing} onClose={()=>setEditing(null)}/>}
      <Dialog open={!!noteGym} onOpenChange={open=>{if(!open)setNoteGymId(null);}}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Notes · {noteGym?.name}</DialogTitle></DialogHeader><p className="whitespace-pre-wrap break-words text-sm">{noteGym?.notes}</p></DialogContent></Dialog>
    </div>
  );
}
