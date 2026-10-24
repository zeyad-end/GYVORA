import { describe, it, expect } from 'vitest';
import { enterPrototype } from '@/lib/prototype-login';
import { submitDemoGymRequest, rejectRequest, approveRequest, getDemoState, setGymStatus, demoOwnerHasAccess, getDemoAccount, deleteGym, setDemoSession } from '@/lib/demo';

describe('local gym lifecycle',()=>{
 it('reapproves the same rejected request without duplicating its gym',()=>{
  enterPrototype({destination:'gym',name:'Fictional lifecycle',email:'fictional-lifecycle@example.invalid'},false);
  const req=submitDemoGymRequest('Fictional lifecycle gym','Monthly Plan');
  rejectRequest(req.id);approveRequest(req.id);approveRequest(req.id);
  expect(getDemoState().requests.find(r=>r.id===req.id)?.status).toBe('Approved');
  expect(getDemoState().gyms.filter(g=>g.email===req.email)).toHaveLength(1);
 });
 it('freeze saves optional reason and unfreeze restores access',()=>{
  const gym=getDemoState().gyms.find(g=>g.email==='fictional-lifecycle@example.invalid');if(!gym)throw new Error('Test gym missing');
  const account=getDemoAccount();if(!account)throw new Error('Test account missing');
  setGymStatus(gym.id,'Frozen','Fictional reason');expect(demoOwnerHasAccess(account)).toBe(false);
  expect(getDemoState().gyms.find(g=>g.id===gym.id)?.freezeNote).toBe('Fictional reason');
  setGymStatus(gym.id,'Active');expect(demoOwnerHasAccess(account)).toBe(true);
 });
 it('deletion blocks an existing session and later owner entry',()=>{
  const gym=getDemoState().gyms.find(g=>g.email==='fictional-lifecycle@example.invalid');if(!gym)throw new Error('Test gym missing');
  deleteGym(gym.id);expect(getDemoAccount()?.deletedAt).toBeTruthy();
  const acc=getDemoAccount();if(!acc)throw new Error('Test account missing');expect(demoOwnerHasAccess(acc)).toBe(false);
  setDemoSession(null);expect(()=>enterPrototype({destination:'gym',name:'Fictional lifecycle',email:acc.email},false)).toThrow('deleted');
 });
});