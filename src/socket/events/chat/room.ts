import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { RoomPayloadSchema } from "@/types";
import { logger } from "@/lib/logger";

export function registerRoomEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  socket.on("joinRoom", (data) => {
    try {
      const validatedData = RoomPayloadSchema.parse(data);
      const { room } = validatedData;
      
      socket.join(room);
      logger.info("User joined room", { socketId: socket.id, room });
      
      socket.to(room).emit("userJoined", {
        username: socket.data.username || "Anonymous",
        socketId: socket.id,
      });
    } catch (error) {
      logger.error("Error joining room", { error, data });
      socket.emit("error", { message: "Invalid room data" });
    }
  });

  socket.on("leaveRoom", (data) => {
    try {
      const validatedData = RoomPayloadSchema.parse(data);
      const { room } = validatedData;
      
      socket.leave(room);
      logger.info("User left room", { socketId: socket.id, room });
      
      socket.to(room).emit("userLeft", {
        username: socket.data.username || "Anonymous",
        socketId: socket.id,
      });
    } catch (error) {
      logger.error("Error leaving room", { error, data });
      socket.emit("error", { message: "Invalid room data" });
    }
  });
}
