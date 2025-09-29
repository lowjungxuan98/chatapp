import { z } from 'zod';
import { emptySchema, createApiSchema, passwordConfirmSchema } from '@/types/auth/common';

const resetPasswordSchema = passwordConfirmSchema;

export const resetPasswordApiSchema = createApiSchema(
  emptySchema,
  z.object({ token: z.string() }),
  resetPasswordSchema
);

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export { resetPasswordSchema };