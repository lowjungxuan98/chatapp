import type { Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";

export async function remote(
  socket: Socket<ClientToServer, ServerToClient>,
) {
  const roomName = socket.data.userId;
  await socket.join(roomName);
  socket.emit("remotechannel", roomName);
}
