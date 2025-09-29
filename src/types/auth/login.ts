import { z } from 'zod';
import { emptySchema, createApiSchema, emailSchema } from '@/types/auth/common';

const loginSchema = emailSchema.extend({
  password: z.string().min(6),
});

export const loginApiSchema = createApiSchema(emptySchema, emptySchema, loginSchema);

export type LoginData = z.infer<typeof loginSchema>;

export { loginSchema };