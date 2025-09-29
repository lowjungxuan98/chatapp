import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import type { FriendRequestDeclinedPayload } from '@/types';
import { logger } from '@/lib/logger';

type SocketIO = SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>;

export function emitFriendDeclined(io: SocketIO, requesterId: string, payload: FriendRequestDeclinedPayload): void {
  try {
    io.to(requesterId).emit('friend:request:declined', payload);
    logger.info('Friend declined emitted', { requesterId, requestId: payload.requestId });
  } catch (error) {
    logger.error('Failed to emit friend:request:declined', {
      requesterId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

