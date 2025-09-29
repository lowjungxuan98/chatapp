import { z } from 'zod';
import { emptySchema, createApiSchema } from '@/types/friend/common';

const onlineStatusBodySchema = z.object({
  userIds: z.array(z.cuid()).min(1).max(100),
});

export const onlineStatusApiSchema = createApiSchema(emptySchema, emptySchema, onlineStatusBodySchema);

export type OnlineStatusBodyData = z.infer<typeof onlineStatusBodySchema>;

export interface OnlineStatusResponse {
  statuses: Record<string, boolean>;
}

