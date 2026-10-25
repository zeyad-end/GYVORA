import { describe, expect, it } from 'vitest';
import { registrationSchema } from '@/lib/registration';
import { matchesAccountType, normalizeContact, temporaryVerificationEnabled, verifyTemporaryCode } from '@/lib/signup-verifier';
describe('unified persistent signup rules', () => {
  for (const account_type of ['gym', 'individual']) {
    it(`${account_type} requires at least one contact`, () => {
      const row = { full_name: 'Fictional Person', password: 'test-password', account_type };
      expect(registrationSchema.safeParse(row).success).toBe(false);
      expect(registrationSchema.safeParse({ ...row, email: 'fictional@example.test' }).success).toBe(true);
      expect(registrationSchema.safeParse({ ...row, phone: '+12025550199' }).success).toBe(true);
    });
  }
  it('does not offer public administrator signup', () => {
    expect(registrationSchema.safeParse({full_name:'Fictional',password:'test-password',email:'f@example.test',account_type:'dashboard'}).success).toBe(false);
  });
  it('accepts only nonempty temporary codes in development', () => {
    expect(() => verifyTemporaryCode('anything', true)).not.toThrow();
    expect(() => verifyTemporaryCode('   ', true)).toThrow();
  });
  it('production builds fail closed even outside a production runtime', () => {
    expect(temporaryVerificationEnabled(false, 'development')).toBe(false);
    expect(() => verifyTemporaryCode('anything', temporaryVerificationEnabled(false, undefined))).toThrow();
  });
  it('production runtime disables temporary codes even for a development build', () => {
    expect(temporaryVerificationEnabled(true, 'production')).toBe(false);
    expect(temporaryVerificationEnabled(true, 'development')).toBe(true);
  });
  it('phone credentials use normalized international numbers', () => {
    expect(normalizeContact('phone', '+1 (202) 555-0199')).toBe('+12025550199');
    expect(() => normalizeContact('phone', '2025550199')).toThrow();
  });
  it('login must match the stored account type and trusted admin role', () => {
    expect(matchesAccountType('gym','client',false)).toBe(false);
    expect(matchesAccountType('individual','owner',false)).toBe(false);
    expect(matchesAccountType('gym','owner',false)).toBe(true);
    expect(matchesAccountType('individual','client',false)).toBe(true);
    expect(matchesAccountType('dashboard','owner',false)).toBe(false);
    expect(matchesAccountType('dashboard','client',true)).toBe(true);
  });
});