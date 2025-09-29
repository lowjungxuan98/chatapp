import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import type { FriendRemovedPayload } from '@/types';
import { logger } from '@/lib/logger';

type SocketIO = SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>;

export function emitFriendRemoved(io: SocketIO, userId1: string, userId2: string, payload: FriendRemovedPayload): void {
  try {
    io.to(userId1).emit('friend:removed', payload);
    io.to(userId2).emit('friend:removed', payload);
    logger.info('Friend removed emitted', { userId1, userId2 });
  } catch (error) {
    logger.error('Failed to emit friend:removed', {
      userId1,
      userId2,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

