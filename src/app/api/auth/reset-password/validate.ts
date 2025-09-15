import { z } from 'zod';
import { resetPasswordSchema as authResetPasswordSchema } from '@/lib/validations/auth';

export const resetPassword = z.object({
  query: z.object({
    token: z.string().min(1, 'Token is required')
  }),
  body: authResetPasswordSchema
});
