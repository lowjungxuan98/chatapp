import { z } from "zod";

// ============================================================================
// Socket.IO Event Interfaces
// ============================================================================

export interface ChatMessage {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  socketId: string;
}

export interface ServerToClient {
  remote: (data: { message: string }) => void;
  remotechannel: (roomName: string) => void;
  joinRemote: (roomName: string) => void;
  tap: (data: {x: number, y: number}) => void;
}

export interface ClientToServer {
  remote: () => void;
  remotechannel: (roomName: string) => void;
  joinRemote: (roomName: string) => void;
  tap: (data: {x: number, y: number}) => void;
}

  export interface InterServer {
  // Cross-server events (if using Redis adapter)
  // Add any inter-server communication events here
  [key: string]: unknown;
}

export interface SocketData {
  // Per-socket metadata
  username?: string;
  userId?: string;
  rooms?: string[];
}