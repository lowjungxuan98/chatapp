import { z } from 'zod';

export const sendVerificationEmailSchema = z.object({
  query: z.object({}),
  body: z.object({})
});
