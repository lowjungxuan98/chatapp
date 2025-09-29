import { io, Socket, type ManagerOptions, type SocketOptions } from 'socket.io-client';
import type { 
  ClientToServerEvents, 
  ServerToClientEvents 
} from '@/types/socket';

export const defaultSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export const defaultSocketOptions: Partial<ManagerOptions & SocketOptions> = {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ['websocket'],
  withCredentials: true,
};

export function client(
  url: string = defaultSocketUrl,
  options: Partial<ManagerOptions & SocketOptions> = defaultSocketOptions,
  auth?: { userId?: string; username?: string }
): Socket<ServerToClientEvents, ClientToServerEvents> {
  const socketOptions = {
    ...options,
    ...(auth && { auth }),
  };
  return io(url, socketOptions);
}
