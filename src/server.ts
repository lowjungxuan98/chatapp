import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { instrument } from "@socket.io/admin-ui";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev /*, hostname, port*/ });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: ["*"],
      credentials: true,
    },
    // 本地用 Postman 验证时可只开 websocket；生产可用默认 ["polling","websocket"]
    // transports: ["websocket"],
    connectionStateRecovery: {},   // 启用状态恢复（v4.6+）
  });

  if (process.env.REDIS_URL) {
    const pub = createClient({ url: process.env.REDIS_URL });
    const sub = pub.duplicate();
    await Promise.all([pub.connect(), sub.connect()]);
    io.adapter(createAdapter(pub, sub));
  }

  instrument(io, { auth: false });

  io.engine.on("connection_error", (err: Error & { code?: string }) => {
    console.error("EIO connection_error:", err.code, err.message);
  });

  io.on("connection", (socket: Socket) => {
    console.log("Server", "User connected:", socket.id);

    socket.on("message", (data: unknown) => {
      console.log("Server", "Message received:", data);
      socket.emit("response", `Server received: ${JSON.stringify(data)}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
});
