import { z } from 'zod';
export { emptySchema, createApiSchema } from '@/types/common';

export const emailSchema = z.object({ email: z.email() });

const passwordSchema = z
  .string()
  .min(8)
  .regex(/(?=.*[a-z])/)
  .regex(/(?=.*[A-Z])/)
  .regex(/(?=.*\d)/);

export const passwordConfirmSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

