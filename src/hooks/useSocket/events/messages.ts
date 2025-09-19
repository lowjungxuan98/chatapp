import type { ChatMessage, ClientToServer } from "@/types";
import type { IOSocket } from "../connection";

export function setupMessageEvents(
  socket: IOSocket,
  onMessage: (message: ChatMessage) => void
) {
  socket.on("message", onMessage);
}

export function emitMessageEvent(
  socket: IOSocket | null,
  content: string,
  username: string
) {
  if (socket && content.trim()) {
    socket.emit("message", { 
      content: content.trim(), 
      username 
    });
  }
}

export function emitGenericEvent<K extends keyof ClientToServer>(
  socket: IOSocket | null,
  event: K, 
  ...args: Parameters<ClientToServer[K]>
) {
  socket?.emit(event, ...args);
}
