import { z } from 'zod';
import type { BlockRelation } from '@prisma/client';
import { userIdSchema, emptySchema, paginationSchema, createApiSchema, type MessageResponse, type UserWithEmail } from '@/types/friend/common';

export const blockUserApiSchema = createApiSchema(userIdSchema, emptySchema, emptySchema);

const getBlockListQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const getBlockListApiSchema = createApiSchema(emptySchema, getBlockListQuerySchema, emptySchema);

export type GetBlockListQueryData = z.infer<typeof getBlockListQuerySchema>;

export type BlockRelationWithUser = BlockRelation & { blocked: UserWithEmail };

export type BlockUserResponse = MessageResponse;

export interface GetBlockListResponse {
  blockList: BlockRelationWithUser[];
  total: number;
  limit: number;
  offset: number;
}

