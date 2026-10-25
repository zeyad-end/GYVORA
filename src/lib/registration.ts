import { z } from 'zod';
export const registrationSchema = z.object({
 full_name: z.string().trim().min(1).max(100),
 phone: z.string().trim().max(30).default(''),
 email: z.union([z.string().trim().email().max(255), z.literal('')]).default(''),
 password: z.string().min(8).max(128),
 account_type: z.enum(['gym', 'individual']),
}).superRefine((value, ctx) => {
 if (!value.phone && !value.email) ctx.addIssue({ code: 'custom', path: ['email'], message: 'Enter either a Phone Number or Email.' });
});