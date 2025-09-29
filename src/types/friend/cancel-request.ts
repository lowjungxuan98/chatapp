import { requestIdSchema, emptySchema, createApiSchema } from '@/types/friend/common';

export const cancelFriendRequestApiSchema = createApiSchema(requestIdSchema, emptySchema, emptySchema);

