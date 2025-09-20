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
  message: (message: ChatMessage) => void;
  userJoined: (data: { username: string; socketId: string }) => void;
  userLeft: (data: { username: string; socketId: string }) => void;
  typing: (data: { username: string; isTyping: boolean }) => void;
  error: (data: { message: string }) => void;
  activeUsers: (users: Array<{ username: string; socketId: string; lastSeen: Date }>) => void;
}

export interface ClientToServer {
  message: (data: { content: string; username?: string }) => void;
  joinRoom: (data: { room: string }) => void;
  leaveRoom: (data: { room: string }) => void;
  typing: (data: { isTyping: boolean }) => void;
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

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const MessagePayloadSchema = z.object({
  content: z.string().min(1).max(1000),
  username: z.string().optional(),
});

export const RoomPayloadSchema = z.object({
  room: z.string().min(1).max(50),
});

export const TypingPayloadSchema = z.object({
  isTyping: z.boolean(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type MessagePayload = z.infer<typeof MessagePayloadSchema>;
export type RoomPayload = z.infer<typeof RoomPayloadSchema>;
export type TypingPayload = z.infer<typeof TypingPayloadSchema>;
