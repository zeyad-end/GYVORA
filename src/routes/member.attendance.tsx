import {createFileRoute} from '@tanstack/react-router';
import {useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useCloud} from '@/components/CloudProvider';
import {ClientShell} from '@/components/ClientShell';
import {DataTable,td} from '@/components/kit';
import {seo} from '@/lib/seo';
import type {AttendanceEvent} from '@/lib/store';
export const Route=createFileRoute('/member/attendance')({head:()=>seo('My attendance','Your chronological IronHaus gym visits and check-in times.'),component:Attendance});
function Attendance(){const c=useCloud();const [list,setList]=useState<Array<AttendanceEvent&{gym:string}>>([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true);useEffect(()=>{if(!c.profile)return;void supabase.from('gym_records').select('*').eq('kind','attendance').eq('client_id',c.profile.id).order('created_at',{ascending:false}).then(({data,error})=>{if(error)setError(error.message);else setList((data??[]).map(x=>({...x.data as unknown as AttendanceEvent,gym:c.gyms.find(g=>g.id===x.gym_id)?.name??'Gym'})).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)));setLoading(false);});},[c.profile?.id,c.gyms]);return <ClientShell title="Attendance History">{error&&<p role="alert" className="text-destructive">{error}</p>}<DataTable head={['Visit Date','Check-in Time','Gym Name']}>{list.map(x=><tr key={x.id}><td className={td}>{x.date}</td><td className={td}>{x.time}</td><td className={td}>{x.gym}</td></tr>)}</DataTable>{!list.length&&<p className="py-8 text-muted-foreground">{loading?'Loading visits…':'No visits recorded yet.'}</p>}</ClientShell>}