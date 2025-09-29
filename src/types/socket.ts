import type {
  S2CFriendEvents,
  C2SFriendEvents,
} from '@/types';
import { Server as SocketIOServer } from 'socket.io';

export interface ServerToClientEvents 
  extends S2CFriendEvents {}

export interface ClientToServerEvents 
  extends C2SFriendEvents {}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  username?: string;
  userId?: string;
  sessionId?: string;
  authenticated?: boolean;
}

export type ServerToClient = ServerToClientEvents;
export type ClientToServer = ClientToServerEvents;
export type InterServer = InterServerEvents;

// Global Socket.IO instance storage (stored in global namespace)
export function setSocketIO(
  io: SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData>
): void {
  global.socketIO = io;
}

export function getSocketIO(): 
  SocketIOServer<ClientToServer, ServerToClient, InterServer, SocketData> | undefined {
  return global.socketIO;
}
