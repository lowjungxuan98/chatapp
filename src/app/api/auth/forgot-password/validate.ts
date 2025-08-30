import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  query: z.object({}),
  body: z.object({
    email: z.string().email('Invalid email format')
  })
});
