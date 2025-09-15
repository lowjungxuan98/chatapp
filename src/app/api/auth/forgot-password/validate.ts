import { z } from 'zod';
import { forgotPasswordSchema as authForgotPasswordSchema } from '@/lib/validations/auth';

export const forgotPassword = z.object({
  query: z.object({}),
  body: authForgotPasswordSchema
});
