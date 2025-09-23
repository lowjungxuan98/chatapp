import { instrument } from "@socket.io/admin-ui";
import {  adapter } from "@/socket/server/adapter";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import type { ClientToServer, ServerToClient, InterServer, SocketData } from "@/types";
import { connection, disconnect } from "@/socket/server/events/connection";
import { middleware } from "@/socket/server/middleware";

export async function server(server: HTTPServer) {
    const io = new Server<ClientToServer, ServerToClient, InterServer, SocketData>(
        server,
        {
            path: "/socket.io",
            cors: {
                origin: ["*"],
                credentials: true,
            },
            connectionStateRecovery: {},
        }
    );
    await adapter(io);
    instrument(io, { auth: false });
    io.on("connection", (socket) => connection(socket, io));
    io.on("disconnect", disconnect);
    middleware(io);
    return io;
}