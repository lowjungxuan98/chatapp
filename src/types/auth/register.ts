import { z } from 'zod';
import { emptySchema, createApiSchema, emailSchema, passwordConfirmSchema } from '@/types/auth/common';

const registerSchema = emailSchema.merge(passwordConfirmSchema).extend({
  name: z.string().min(2).max(50),
});

export const registerApiSchema = createApiSchema(emptySchema, emptySchema, registerSchema);

export type RegisterData = z.infer<typeof registerSchema>;

export { registerSchema };