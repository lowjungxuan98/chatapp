import { logger } from "@/lib/logger";
import { ClientToServer, ServerToClient } from "@/types";
import { Server, Socket } from "socket.io";

export async function joinRemote(
    socket: Socket<ClientToServer, ServerToClient>,
    io: Server<ClientToServer, ServerToClient>,
    data: {
        roomName: string;
    }
) {
  const roomName = data.roomName;
  await socket.join(roomName);  
  socket.emit("remotechannel", roomName);
}