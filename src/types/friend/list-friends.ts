import { z } from 'zod';
import { friendStatusSchema, paginationSchema, emptySchema, createApiSchema, type FriendRelationWithMinimalUser } from '@/types/friend/common';

const getFriendsQuerySchema = paginationSchema.extend({
  status: friendStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const getFriendsApiSchema = createApiSchema(emptySchema, getFriendsQuerySchema, emptySchema);

export type GetFriendsQueryData = z.infer<typeof getFriendsQuerySchema>;

export interface GetFriendsListResponse {
  friends: FriendRelationWithMinimalUser[];
  total: number;
  limit: number;
  offset: number;
}

