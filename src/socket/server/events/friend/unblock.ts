import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import type { UserUnblockedPayload } from '@/types';
import { logger } from '@/lib/logger';

type SocketIO = SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>;

export function emitFriendUnblock(io: SocketIO, unblockedUserId: string, payload: UserUnblockedPayload): void {
  try {
    io.to(unblockedUserId).emit('friend:unblocked', payload);
    logger.info('User unblocked emitted', { unblockedUserId, blockerId: payload.blockerId });
  } catch (error) {
    logger.error('Failed to emit friend:unblocked', {
      unblockedUserId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

