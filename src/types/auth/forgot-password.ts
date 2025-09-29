import { z } from 'zod';
import { emptySchema, createApiSchema, emailSchema } from '@/types/auth/common';

const forgotPasswordSchema = emailSchema;
export const forgotPasswordApiSchema = createApiSchema(emptySchema, emptySchema, emailSchema);

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export { forgotPasswordSchema };