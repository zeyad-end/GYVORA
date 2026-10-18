import {createFileRoute} from '@tanstack/react-router';
import {useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import type {Json} from '@/integrations/supabase/types';
import {useCloud} from '@/components/CloudProvider';
import {ClientShell} from '@/components/ClientShell';
import {ExerciseImage} from '@/components/ProgramEditor';
import {Button} from '@/components/ui/button';
import type {Workout} from '@/lib/store';
import {toast} from 'sonner';
import {seo} from '@/lib/seo';
export const Route=createFileRoute('/member/browse')({head:()=>seo('Browse gym programs','Save independent copies of workout programs from your gyms.'),component:Browse});
function Browse(){const c=useCloud();const [rows,setRows]=useState<Array<{id:string;gym:string;program:Workout}>>([]);const [loading,setLoading]=useState(true);useEffect(()=>{void supabase.from('gym_records').select('*').eq('kind','workouts').then(({data,error})=>{if(error)toast.error(error.message);else setRows((data??[]).map(x=>({id:x.id,gym:c.gyms.find(g=>g.id===x.gym_id)?.name??'Gym',program:x.data as unknown as Workout})));setLoading(false);});},[c.gyms]);return <ClientShell title="Browse Gym Programs"><div className="space-y-8">{rows.map((r,i)=><section key={r.id+i} className="border-b pb-6"><span className="eyebrow">{r.gym}</span><h2 className="mt-2 text-xl font-semibold">{r.program.name}</h2><ul className="my-4 space-y-3">{r.program.exercises.map((e,j)=><li key={j} className="flex items-center justify-between gap-4"><div>{e.name}<span className="ml-3 text-sm text-muted-foreground">{e.sets} sets · {e.reps} reps</span></div><ExerciseImage path={e.image}/></li>)}</ul><Button onClick={async()=>{if(!c.profile)return;const independent=structuredClone(r.program);independent.id=crypto.randomUUID();const {error}=await supabase.from('client_programs').insert({user_id:c.profile.id,definition:independent as unknown as Json});if(error)toast.error(error.message);else toast.success('Program saved to your personal workouts');}}>Save Program</Button></section>)}</div>{!rows.length&&<p className="py-8 text-muted-foreground">{loading?'Loading gym programs…':'No gym programs available for your account.'}</p>}</ClientShell>}