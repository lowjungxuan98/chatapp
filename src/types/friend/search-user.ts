import { z } from 'zod';
import { emptySchema, createApiSchema, type UserWithEmail } from '@/types/friend/common';

const searchUserQuerySchema = z.object({
  q: z.string().min(1),
  type: z.enum(['email', 'name']).default('name'),
  limit: z.coerce.number().int().positive().max(20).default(10),
});

export const searchUserApiSchema = createApiSchema(emptySchema, searchUserQuerySchema, emptySchema);

export type SearchUserQueryData = z.infer<typeof searchUserQuerySchema>;

export type RelationStatus = 'none' | 'friend' | 'pending_sent' | 'pending_received' | 'blocked' | 'blocked_by';

export interface UserSearchResult extends UserWithEmail {
  relationStatus: RelationStatus;
}

export interface SearchUserResponse {
  users: UserSearchResult[];
  total: number;
}

