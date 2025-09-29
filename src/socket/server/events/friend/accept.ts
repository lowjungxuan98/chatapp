import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import type { FriendRequestAcceptedPayload } from '@/types';
import { logger } from '@/lib/logger';

type SocketIO = SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>;

export function emitFriendAccepted(io: SocketIO, userId1: string, userId2: string, payload1: FriendRequestAcceptedPayload, payload2: FriendRequestAcceptedPayload): void {
  try {
    io.to(userId1).emit('friend:request:accepted', payload1);
    io.to(userId2).emit('friend:request:accepted', payload2);
    logger.info('Friend accepted emitted', { userId1, userId2, requestId: payload1.requestId });
  } catch (error) {
    logger.error('Failed to emit friend:request:accepted', {
      userId1,
      userId2,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

