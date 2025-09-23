import { Server, Socket } from "socket.io";
import { ClientToServer, ServerToClient } from "@/types";

export async function tap (
    socket: Socket<ClientToServer, ServerToClient>,
    io: Server<ClientToServer, ServerToClient>,
    data: {x: number, y: number}
) {
    io.to(socket.data.userId).emit("tap", data);
}