export { registerMessageEvents } from "./message";
export { registerRoomEvents } from "./room";
export { registerTypingEvents } from "./typing";
export { registerConnectionEvents } from "./connection";

import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { registerMessageEvents } from "./message";
import { registerRoomEvents } from "./room";
import { registerTypingEvents } from "./typing";
import { registerConnectionEvents } from "./connection";

export function registerChatEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  registerConnectionEvents(io, socket);
  registerMessageEvents(io, socket);
  registerRoomEvents(io, socket);
  registerTypingEvents(io, socket);
}
