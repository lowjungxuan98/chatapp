import { friendIdSchema, emptySchema, createApiSchema, type FriendRelationWithMinimalUser, type MessageResponse } from '@/types/friend/common';

export const sendFriendRequestApiSchema = createApiSchema(emptySchema, emptySchema, friendIdSchema);

export interface SendFriendRequestResponse extends MessageResponse {
  request: FriendRelationWithMinimalUser;
}

