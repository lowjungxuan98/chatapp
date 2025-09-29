import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import type { FriendRequestSentPayload } from '@/types';
import { logger } from '@/lib/logger';

type SocketIO = SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>;

export function emitFriendRequest(io: SocketIO, targetUserId: string, payload: FriendRequestSentPayload): void {
  try {
    io.to(targetUserId).emit('friend:request:received', payload);
    logger.info('Friend request emitted', { targetUserId, from: payload.from.id, requestId: payload.requestId });
  } catch (error) {
    logger.error('Failed to emit friend:request:received', {
      targetUserId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

