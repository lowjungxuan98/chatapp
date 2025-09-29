import { z } from 'zod';
import { paginationSchema, emptySchema, createApiSchema, type FriendRelationWithMinimalUser } from '@/types/friend/common';

const getPendingRequestsQuerySchema = paginationSchema.extend({
  type: z.enum(['received', 'sent']),
});

export const getPendingRequestsApiSchema = createApiSchema(emptySchema, getPendingRequestsQuerySchema, emptySchema);

export type GetPendingRequestsQueryData = z.infer<typeof getPendingRequestsQuerySchema>;

export interface GetPendingRequestsResponse {
  requests: FriendRelationWithMinimalUser[];
  total: number;
  limit: number;
  offset: number;
  type: 'received' | 'sent';
}

