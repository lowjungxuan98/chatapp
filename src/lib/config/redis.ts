import { createClient } from 'redis';

const globalForRedis = globalThis as unknown as { redis?: ReturnType<typeof createClient> };

export const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
};

