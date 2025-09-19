import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { MessagePayloadSchema } from "@/types";
import { logger } from "@/lib/logger";

export function registerMessageEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  socket.on("message", (data) => {
    try {
      const validatedData = MessagePayloadSchema.parse(data);
      
      logger.info("Message received", { 
        socketId: socket.id, 
        content: validatedData.content,
        username: validatedData.username 
      });
      
      const message = {
        id: Date.now().toString(),
        content: validatedData.content.trim(),
        username: validatedData.username || socket.data.username || "Anonymous",
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      };
      
      io.to("default").emit("message", message);
    } catch (error) {
      logger.error("Invalid message payload", { error, data });
      socket.emit("error", { message: "Invalid message format" });
    }
  });
}
