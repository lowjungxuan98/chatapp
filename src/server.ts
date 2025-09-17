import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, { 
    cors: { origin: "*" },
    path: "/socket.io"
  });

  io.on("connection", (socket: Socket) => {
    console.log('User connected:', socket.id);
    socket.emit('hello', 'Hello from server!');
    
    socket.on('message', (data: unknown) => {
        console.log('Message received:', data);
        socket.emit('response', `Server received: ${JSON.stringify(data)}`);
    });
    
    socket.on('turn-on', (data: unknown) => {
        console.log('Turn-on event received:', data);
        io.emit('device-status', { status: 'on', data });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
