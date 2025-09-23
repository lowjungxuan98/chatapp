import { logger } from "@/lib/logger";
import { Socket } from "socket.io";

export const disconnect = (socket: Socket) => {
  logger.info("User disconnected", {
    socketId: socket.id
  });
};