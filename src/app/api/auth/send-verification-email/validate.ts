import { z } from 'zod';
import { sendVerificationEmailSchema as authSendVerificationEmailSchema } from '@/lib/validations/auth';

export const sendVerificationEmail = z.object({
  query: z.object({}),
  body: authSendVerificationEmailSchema
});
