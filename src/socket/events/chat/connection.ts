import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { logger } from "@/lib/logger";

export function registerConnectionEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  logger.info("User connected", { socketId: socket.id });
  socket.join("default");

  socket.on("disconnect", (reason) => {
    logger.info("User disconnected", { 
      socketId: socket.id, 
      reason,
      username: socket.data.username 
    });
  });
}
