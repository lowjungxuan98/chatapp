import type { Socket } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import type { FriendOnlineStatusPayload } from '@/types';
import { redis, connectRedis } from '@/lib/config/redis';
import { getFriendsList } from '@/app/api/friends/service';
import { logger } from '@/lib/logger';

export function connect(socket: Socket<ClientToServer, ServerToClient, InterServer, SocketData>) {
  const userId = socket.data.userId;

  if (userId) {
    (async () => {
      try {
        await connectRedis();
        await redis.set(`user:online:${userId}`, '1', { EX: 3600 });

        const { friends } = await getFriendsList(userId, {
          status: 'ACCEPTED',
          limit: 1000,
          offset: 0,
          sortBy: 'createdAt',
          order: 'desc',
        });

        const friendIds = friends.map((relation) =>
          relation.userId === userId ? relation.friendId : relation.userId
        );

        friendIds.forEach((friendId) => {
          socket.to(friendId).emit('friend:online', { userId, online: true });
        });

        logger.info('User online notification sent', { userId, friendCount: friendIds.length });
      } catch (error) {
        logger.error('Failed to handle user online', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })();

    socket.on('disconnect', async () => {
      try {
        await connectRedis();
        await redis.del(`user:online:${userId}`);

        const { friends } = await getFriendsList(userId, {
          status: 'ACCEPTED',
          limit: 1000,
          offset: 0,
          sortBy: 'createdAt',
          order: 'desc',
        });

        const friendIds = friends.map((relation) =>
          relation.userId === userId ? relation.friendId : relation.userId
        );

        const payload: FriendOnlineStatusPayload = {
          userId,
          online: false,
          lastSeen: new Date().toISOString(),
        };

        friendIds.forEach((friendId) => {
          socket.to(friendId).emit('friend:offline', payload);
        });

        logger.info('User offline notification sent', { userId, friendCount: friendIds.length });
      } catch (error) {
        logger.error('Failed to handle user offline', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }
}
