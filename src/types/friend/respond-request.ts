import type { FriendRelation } from '@prisma/client';
import { z } from 'zod';
import { requestIdSchema, emptySchema, createApiSchema, type MessageResponse } from '@/types/friend/common';

const actionSchema = z.object({ action: z.enum(['accept', 'decline']) });

export const respondFriendRequestApiSchema = createApiSchema(requestIdSchema, emptySchema, actionSchema);

export interface RespondToFriendRequestResponse extends MessageResponse {
  request: FriendRelation;
}

