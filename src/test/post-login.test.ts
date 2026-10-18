import { describe, it, expect } from 'vitest';
import { destinationFor } from '@/lib/post-login';

describe('sign-in routing', () => {
  it('client goes to client account', () => expect(destinationFor('client', [{ role: 'Client', gym_id: 'g1' }])).toBe('/member'));
  it('staff with one gym goes to dashboard', () => expect(destinationFor('staff', [{ role: 'Trainer', gym_id: 'g1' }])).toBe('/dashboard'));
  it('staff with several gyms picks a gym', () => expect(destinationFor('staff', [{ role: 'Trainer', gym_id: 'g1' }, { role: 'Trainer', gym_id: 'g2' }])).toBe('/gyms'));
  it('owner without approved gym goes to subscription request', () => expect(destinationFor('owner', [])).toBe('/subscription-request'));
  it('approved owner goes to dashboard', () => expect(destinationFor('owner', [{ role: 'Owner', gym_id: 'g1' }])).toBe('/dashboard'));
});
