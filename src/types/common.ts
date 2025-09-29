import { z } from 'zod';

export const emptySchema = z.object({});

export const createApiSchema = <P extends z.ZodTypeAny, Q extends z.ZodTypeAny, B extends z.ZodTypeAny>(
  params: P, query: Q, body: B
) => z.object({ params, query, body });

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export interface MessageResponse {
  message: string;
}