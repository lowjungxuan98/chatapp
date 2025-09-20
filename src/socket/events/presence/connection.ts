import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { logger } from "@/lib/logger";

const activeUsers = new Map<string, { username: string; socketId: string; lastSeen: Date }>();

export function registerPresenceConnectionEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  const username = socket.data.username || "Anonymous";
  
  activeUsers.set(socket.id, {
    username,
    socketId: socket.id,
    lastSeen: new Date(),
  });
  
  io.emit("userJoined", { username, socketId: socket.id });
  
  const users = Array.from(activeUsers.values());
  socket.emit("activeUsers", users);
  
  logger.info("User presence tracked", { username, socketId: socket.id });

  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      io.emit("userLeft", { username: user.username, socketId: socket.id });
      logger.info("User presence removed", { username: user.username, socketId: socket.id });
    }
  });
}

export { activeUsers };
