import {useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import type {Database} from '@/integrations/supabase/types';
import {Button} from './ui/button';
import {DataTable,PageHeader,td} from './kit';
import {toast} from 'sonner';

export function CloudGymRequests(){
 const [rows,setRows]=useState<Database['public']['Tables']['owner_requests']['Row'][]>([]);
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function load(){const {data,error}=await supabase.from('owner_requests').select('*').order('created_at',{ascending:false});if(error)setError('Could not load gym requests. Please reload.');else {setRows(data??[]);setError('');}}
 useEffect(()=>{void load();},[]);
 async function decide(id:string,name:string,approve:boolean){
  if(!window.confirm(`${approve?'Approve':'Reject'} ${name}?`))return;
  setBusy(true);setError('');
  try {const {error}=await supabase.rpc('decide_owner_request',{request_id:id,approve});if(error)throw error;toast.success(approve?'Gym approved — no payment collected':'Request rejected');await load();}
  catch(e){setError(e instanceof Error?e.message:'Could not save the decision. Please try again.');}
  finally{setBusy(false);}
 }
 return <div><PageHeader title="Gym Requests" subtitle={`Pending: ${rows.filter(r=>r.status==='Pending').length} · Approved: ${rows.filter(r=>r.status==='Approved').length} · Rejected: ${rows.filter(r=>r.status==='Rejected').length}`}/>{error&&<p role="alert" className="mb-4 text-destructive">{error}</p>}<DataTable head={['Gym Name','Plan','Submitted','Status','Decision']}>
 {rows.map(r=><tr key={r.id}><td className={td}>{r.gym_name}</td><td className={td}>{r.plan}</td><td className={td}>{r.created_at.slice(0,10)}</td><td className={td}>{r.status}</td><td className={td}>{r.status==='Pending'?<div className="flex gap-2"><Button size="sm" disabled={busy} onClick={()=>void decide(r.id,r.gym_name,true)}>Approve</Button><Button size="sm" variant="destructive" disabled={busy} onClick={()=>void decide(r.id,r.gym_name,false)}>Reject</Button></div>:r.decided_at?.slice(0,10)??'—'}</td></tr>)}
 </DataTable>{!rows.length&&<p className="py-6 text-muted-foreground">No requests recorded.</p>}</div>;
}