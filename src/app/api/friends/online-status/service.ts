import { redis, connectRedis } from '@/lib/config/redis';

export const getOnlineStatus = async (userIds: string[]): Promise<Record<string, boolean>> => {
  await connectRedis();

  const keys = userIds.map(id => `user:online:${id}`);
  const values = await redis.mGet(keys);

  const statuses: Record<string, boolean> = {};
  userIds.forEach((userId, index) => {
    statuses[userId] = values[index] === '1';
  });

  return statuses;
};

