import { logger } from "@/lib/logger";
import { joinRemote, remote, tap } from "@/socket/server/events";
import { Socket, Server } from "socket.io";

export const connection = (socket: Socket, io: Server) => {
  const auth = socket.handshake.auth
  if (auth) {
    socket.data.username = auth.username;
    socket.data.userId = auth.userId;
  }

  socket.on("remote", async () => await remote(socket, io));
  socket.on("joinRemote", async (data) => await joinRemote(socket, io, data));
  socket.on("tap", async (data) => await tap(socket, io, data));
};