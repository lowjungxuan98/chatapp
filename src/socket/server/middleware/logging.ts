import type { Socket } from 'socket.io';
import type { ClientToServer, ServerToClient, InterServer, SocketData } from '@/types/socket';
import { logger } from '@/lib/logger';

export function loggingMiddleware(
  socket: Socket<ClientToServer, ServerToClient, InterServer, SocketData>,
  next: (err?: Error) => void
) {
  logger.info('New socket connection attempt', {
    socketId: socket.id,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent'],
    origin: socket.handshake.headers.origin,
  });

  // Set up event logging after connection is established
  socket.onAny((eventName, ...args) => {
    logger.debug('Socket event received', {
      socketId: socket.id,
      eventName,
      args,
      userId: socket.data.userId,
      username: socket.data.username,
    });
  });

  // Log disconnection with user context
  socket.on('disconnect', (reason) => {
    logger.info('Socket disconnected', {
      socketId: socket.id,
      reason,
      userId: socket.data.userId,
      username: socket.data.username,
    });
  });

  // Log successful connection
  logger.info('Socket connected successfully', {
    socketId: socket.id,
    userId: socket.data.userId,
    username: socket.data.username,
  });

  next();
}
