import { ClientToServer, ServerToClient } from "@/types";
import { Socket } from "socket.io";

export async function joinRemote(
    socket: Socket<ClientToServer, ServerToClient>,
    data: {
        roomName: string;
    }
) {
  const roomName = data.roomName;
  await socket.join(roomName);  
  socket.emit("remotechannel", roomName);
}