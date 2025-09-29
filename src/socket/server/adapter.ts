import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import { Server as SocketIOServer } from 'socket.io';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export const defaultRedisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

export async function setupRedisAdapter(
  io: SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>,
  config: RedisConfig = defaultRedisConfig
): Promise<void> {
  const pubClient = createClient({
    socket: {
      host: config.host,
      port: config.port,
    },
    password: config.password,
    database: config.db,
  });

  const subClient = pubClient.duplicate();

  await Promise.all([
    pubClient.connect(),
    subClient.connect(),
  ]);

  io.adapter(createAdapter(pubClient, subClient));
}
