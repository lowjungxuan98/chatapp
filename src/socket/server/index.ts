import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { instrument } from "@socket.io/admin-ui";
import { setupRedisAdapter } from "./adapter";
import { registerChatEvents } from "../events/chat";
import { logger } from "@/lib/logger";
import type { 
  ServerToClient, 
  ClientToServer, 
  InterServer, 
  SocketData 
} from "@/types";

export async function createIOServer(httpServer: HTTPServer) {
  const io = new Server<ClientToServer, ServerToClient, InterServer, SocketData>(
    httpServer,
    {
      path: "/socket.io",
      cors: {
        origin: ["*"],
        credentials: true,
      },
      connectionStateRecovery: {},
    }
  );

  await setupRedisAdapter(io);

  instrument(io, { auth: false });

  io.engine.on("connection_error", (err: Error & { code?: string }) => {
    logger.error("Socket.IO connection error", {
      code: err.code,
      message: err.message,
    });
  });

  io.on("connection", (socket) => {
    // Set socket data from auth
    const auth = socket.handshake.auth as { username?: string; userId?: string };
    if (auth) {
      socket.data.username = auth.username;
      socket.data.userId = auth.userId;
    }
    
    logger.info("New socket connection", { 
      socketId: socket.id, 
      username: socket.data.username,
      userId: socket.data.userId 
    });
    registerChatEvents(io, socket);
  });

  logger.info("Socket.IO server initialized", {
    path: "/socket.io",
    hasRedis: !!process.env.REDIS_URL,
  });

  return io;
}
