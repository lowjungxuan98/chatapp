import { loggingMiddleware, authMiddleware } from '@/socket/server/middleware';
import { connect, setupRedisAdapter } from '@/socket/server';
import { Server as HttpServer } from 'node:http';
import { Socket, Server as SocketIOServer, type ServerOptions } from 'socket.io';
import { setSocketIO } from '@/types/socket';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@/types/socket';

export const defaultServerConfig: Partial<ServerOptions> = {
  cors: { 
    origin: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", 
    methods: ['GET', 'POST'], 
    credentials: true 
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
};

export async function server(
  httpServer: HttpServer,
  config: Partial<ServerOptions> = defaultServerConfig
): Promise<SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>> {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, config);

  try {
    await setupRedisAdapter(io);
  } catch {}

  io.use(authMiddleware);
  io.use(loggingMiddleware);
  io.on('connection', connect);
  setSocketIO(io);

  return io;
}