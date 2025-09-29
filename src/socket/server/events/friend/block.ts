import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import type { UserBlockedPayload } from '@/types';
import { logger } from '@/lib/logger';

type SocketIO = SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>;

export function emitFriendBlock(io: SocketIO, blockedUserId: string, payload: UserBlockedPayload): void {
  try {
    io.to(blockedUserId).emit('friend:blocked', payload);
    logger.info('User blocked emitted', { blockedUserId, blockerId: payload.blockerId });
  } catch (error) {
    logger.error('Failed to emit friend:blocked', {
      blockedUserId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

