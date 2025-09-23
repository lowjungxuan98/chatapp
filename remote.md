Framework
Next JS

Requirement
- Must use Redis adapter for Socket.IO (Redis pub/sub required)
- Must be detailed and split into multiple phases (step-by-step, not high-level)

What I had done
1. I had created socket IO
2. Tested with Postman
    - url: http://localhost:3000
    - path: /socket.io
    - client version: v3/v4
3. Test case
    - emit the event: remote
    - json body: { "message": "Hello" }
    - listening: remote
4. Flow for remote
    1. Web will connect to socket
    2. Web will auto create the Room and QRCode with User's ID
    3. Mobile scan the QRCode then join the room
    4. Tap event with channel to mobile socket id


What to paste into ChatGPT

- Paste BOTH the file path and the full code for each file below.
- Use code fences with the language tag so formatting is preserved.
- Keep only socket-related code; exclude unrelated parts.

Server

src/server.ts (or server.cjs if that’s your entry)
```ts
import { createServer } from "node:http";
import next from "next";
import { createIOServer } from "@/socket";
import { logger } from "@/lib/logger";

const app = next({ 
  dev: process.env.NODE_ENV !== "production",
  turbo: true,
  turbopack: true,
});
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);
  
  // Initialize Socket.IO server with our modular setup
  await createIOServer(httpServer);

  httpServer
    .once("error", (err) => {
      logger.error("HTTP server error", err);
      process.exit(1);
    })
    .listen(process.env.PORT || 3000, () => {
      logger.info(`Server ready on http://localhost:${process.env.PORT || 3000}`);
    });
});
```

src/socket/server/index.ts
```ts
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { instrument } from "@socket.io/admin-ui";
import { setupRedisAdapter } from "./adapter";
import type { 
  ServerToClient, 
  ClientToServer, 
  InterServer, 
  SocketData 
} from "@/types";
import { connection, connectionFailed } from "./events/connection";

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
  io.engine.on("connection_error", connectionFailed);
  io.on("connection", (socket) => connection(socket, io));
  return io;
}
```

src/socket/server/events/index.ts
```ts
export * from "./remote";
export * from "./connection";
```

src/socket/server/events/connection/connection.ts
```ts
import { logger } from "@/lib/logger";
import { remote } from "@/socket/server/events";
import { Socket, Server } from "socket.io";

export const connection = (socket: Socket, io: Server) => {
    const auth = socket.handshake.auth
    if (auth) {
      socket.data.username = auth.username;
      socket.data.userId = auth.userId;
    }
    
    logger.info("User connected", { 
      username: socket.data.username,
      userId: socket.data.userId,
      socketId: socket.id
    });
    
    socket.on("remote", remote);
};
```

src/socket/server/events/remote/index.ts
```ts
export { remote } from "./remote";
```

src/socket/server/events/remote/remote.ts
```ts
import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { logger } from "@/lib/logger";

export function remote(
  this: Socket<ClientToServer, ServerToClient>,
  data: unknown
) {
  logger.info("Remote command received", {
    socketId: this.id,
    username: this.data.username,
    userId: this.data.userId,
    data: data
  });

  if (this.data.userId) {
    const roomName = this.data.userId;
    this.join(roomName);
    const socketsInRoom = this.in(roomName).fetchSockets();
    logger.info("Sockets in room", {
      roomName,
      socketsInRoom: socketsInRoom
    });
    this.emit("remotechannel", roomName);
  }

  this.emit("remote", data);
}
```

src/socket/server/adapter.ts (only if you use a custom adapter)
```ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { logger } from "@/lib/logger";

export async function setupRedisAdapter(io: Server) {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    logger.info("No Redis URL provided, using default adapter");
    return;
  }

  try {
    const pub = createClient({ url: redisUrl });
    const sub = pub.duplicate();
    
    await Promise.all([pub.connect(), sub.connect()]);
    
    io.adapter(createAdapter(pub, sub));
    
    logger.info("Redis adapter configured successfully");
    
    pub.on("error", (err) => {
      logger.error("Redis pub client error", err);
    });
    
    sub.on("error", (err) => {
      logger.error("Redis sub client error", err);
    });
  } catch (error) {
    logger.error("Failed to setup Redis adapter", error);
    throw error;
  }
}
```

Client

src/socket/client/config.ts
```ts
import { io, Socket } from "socket.io-client";
import type { ServerToClient, ClientToServer } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export type IOSocket = Socket<ServerToClient, ClientToServer>;

export function client(): IOSocket | null {
  if (typeof window === "undefined") return null;
  const url = SOCKET_URL || window.location.origin;
  const s = io(url, {
    path: "/socket.io",
    forceNew: false,
    autoConnect: false, // Let the provider control when to connect
    withCredentials: true,
  });
  return s as IOSocket;
}
```

src/socket/client/index.ts
```ts
export { client, type IOSocket } from "./config";
export { SocketProvider, useSocket } from "./provider";
```

src/socket/client/provider.tsx
```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { IOSocket } from "@/socket/client";
import { client } from "@/socket/client";
import { useSession } from "next-auth/react";

const SocketContext = createContext<IOSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<IOSocket | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      setSocket((prev) => {
        prev?.close();
        return null;
      });
      return;
    }
    const s = client();
    if (s) {
      if (session?.user) {
        s.auth = {
          username: session?.user?.name,
          userId: session?.user?.id,
        };
      }
      
      const onConnect = () => {
        setSocket(s);
      };
      
      const onDisconnect = () => {
        setSocket(null);
      };

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.connect();

      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.close();
        setSocket(null);
      };
    }
  }, [status, session?.user?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
```

src/components/pages/RemoteControl.tsx
```tsx
"use client";

import { Android } from "@/components/ui/shadcn-io/android";
import { useSocket } from "@/socket/client";
import { useEffect } from "react";

export default function RemoteControl() {
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.emit("remote", { data: { message: "Hello, world!" } });
      socket.on("remotechannel", (data) => {
        console.log(data);
      });
    }
  }, [socket]);

  return (
    <div className="flex justify-center">
      <Android
        className="h-full w-auto"
        videoSrc="https://videos.pexels.com/video-files/14993748/14993748-uhd_1296_2304_30fps.mp4"
      />
    </div>
  );
}
```

Types

src/types/socket.ts
```ts
import { z } from "zod";

// ============================================================================
// Socket.IO Event Interfaces
// ============================================================================

export interface ChatMessage {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  socketId: string;
}

export interface ServerToClient {
  remote: (data: unknown) => void;
  remotechannel: (data: unknown) => void;
}

export interface ClientToServer {
  remote: (data: { data: unknown }) => void;
  remotechannel: (data: { data: unknown }) => void;
}

  export interface InterServer {
  // Cross-server events (if using Redis adapter)
  // Add any inter-server communication events here
  [key: string]: unknown;
}

export interface SocketData {
  // Per-socket metadata
  username?: string;
  userId?: string;
  rooms?: string[];
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const MessagePayloadSchema = z.object({
  content: z.string().min(1).max(1000),
  username: z.string().optional(),
});

export const RoomPayloadSchema = z.object({
  room: z.string().min(1).max(50),
});

export const TypingPayloadSchema = z.object({
  isTyping: z.boolean(),
});
```

Context (for reference only)

remote.md
```md
// paste only this “What to paste” section if needed
```
