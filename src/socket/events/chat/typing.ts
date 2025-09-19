import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { TypingPayloadSchema } from "@/types";
import { logger } from "@/lib/logger";

export function registerTypingEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  socket.on("typing", (data) => {
    try {
      const validatedData = TypingPayloadSchema.parse(data);
      const { isTyping } = validatedData;
      const username = socket.data.username || "Anonymous";
      
      socket.to("default").emit("typing", {
        username,
        isTyping,
      });
    } catch (error) {
      logger.error("Error handling typing event", { error, data });
      socket.emit("error", { message: "Invalid typing data" });
    }
  });
}
