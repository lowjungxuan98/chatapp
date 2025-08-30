import { z } from 'zod';

export const resetPasswordSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Token is required')
  }),
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});
