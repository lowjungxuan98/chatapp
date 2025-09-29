import { z } from 'zod';
import type { FriendRelation, User } from '@prisma/client';
export { emptySchema, createApiSchema, paginationSchema, type MessageResponse } from '@/types/common';

export const userIdSchema = z.object({ userId: z.cuid() });
export const friendIdSchema = z.object({ friendId: z.cuid() });
export const requestIdSchema = z.object({ requestId: z.cuid() });
export const friendStatusSchema = z.enum(['ACCEPTED', 'DECLINED', 'PENDING']);

type MinimalUser = Pick<User, 'id' | 'name' | 'image'>;
export type UserWithEmail = Pick<User, 'id' | 'name' | 'email' | 'image'>;

export type FriendRelationWithMinimalUser = FriendRelation & {
  user: MinimalUser;
  friend: MinimalUser;
};


