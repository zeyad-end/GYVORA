import {describe,it,expect} from 'vitest';
import {assertUniqueClientMembership,membershipStatus} from '@/lib/membership-link';
import {initialState} from '@/lib/store';

describe('owner-added client memberships',()=>{
 const base=initialState.members[0];
 if(!base)throw new Error('Missing fixture');
 const member={...base,id:'fictional-membership',clientId:'fictional-client'};
 it('prevents a second membership for the same client in a gym',()=>{
  expect(()=>assertUniqueClientMembership([member],'fictional-client','another-record')).toThrow('already has a membership');
 });
 it('allows editing the existing linked membership',()=>{
  expect(()=>assertUniqueClientMembership([member],'fictional-client','fictional-membership')).not.toThrow();
 });
 it('allows another gym to add the same client independently',()=>{
  expect(()=>assertUniqueClientMembership([],'fictional-client')).not.toThrow();
 });
 it('shows expired membership from saved dates regardless of stale display status',()=>{
  expect(membershipStatus({start:'2026-09-01',expiry:'2026-10-22'},'2026-10-23')).toBe('Expired');
 });
 it('shows active membership throughout its saved date range',()=>{
  expect(membershipStatus({start:'2026-10-23',expiry:'2026-12-01'},'2026-10-23')).toBe('Active');
 });
});