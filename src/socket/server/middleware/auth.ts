import type { Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@/types/socket';
import { logger } from '@/lib/logger';
import { decode, getToken } from 'next-auth/jwt';
import { NextApiRequest } from 'next';

export async function authMiddleware(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  next: (err?: Error) => void
) {
  try {
    const req = socket.request;
    const token = await getToken({
      req: { headers: req.headers as Record<string, string> },
      secret: process.env.AUTH_SECRET
    });
    if (!token) {
      logger.error('Socket auth failed: Invalid token', { socketId: socket.id });
      return next(new Error('Authentication failed: Invalid token'));
    }

    socket.data.userId = token.userId as string;
    socket.data.username = token.name as string;
    socket.data.authenticated = true;
    await socket.join(token.userId as string);
    next();
  } catch (error) {
    logger.error('Socket auth error', {
      socketId: socket.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(new Error('Authentication failed: Invalid or expired token'));
  }
}
