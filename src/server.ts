import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { instrument } from "@socket.io/admin-ui";

const dev = process.env.NODE_ENV !== "production";
// ⚠️ 容器/云上不要写死 localhost；或者直接不传 hostname
// const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev /*, hostname, port*/ });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      // 生产环境请改成你的前端域名，并按需设置 credentials
      origin: ["*"],
      credentials: true,
    },
    // 本地用 Postman 验证时可只开 websocket；生产可用默认 ["polling","websocket"]
    // transports: ["websocket"],
    connectionStateRecovery: {},   // 启用状态恢复（v4.6+）
  });

  // ===== 多副本：接入 Redis 适配器 =====
  if (process.env.REDIS_URL) {
    const pub = createClient({ url: process.env.REDIS_URL });
    const sub = pub.duplicate();
    await Promise.all([pub.connect(), sub.connect()]);
    io.adapter(createAdapter(pub, sub));
  }

  // （可选）Admin UI，浏览器打开 https://admin.socket.io 即可连
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
