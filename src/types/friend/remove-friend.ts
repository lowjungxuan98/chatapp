import { friendIdSchema, emptySchema, createApiSchema, type MessageResponse } from '@/types/friend/common';

export const removeFriendApiSchema = createApiSchema(emptySchema, emptySchema, friendIdSchema);

export type RemoveFriendResponse = MessageResponse;

