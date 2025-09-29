import { userIdSchema, emptySchema, createApiSchema, type MessageResponse } from '@/types/friend/common';

export const unblockUserApiSchema = createApiSchema(emptySchema, emptySchema, userIdSchema);

export type UnblockUserResponse = MessageResponse;

