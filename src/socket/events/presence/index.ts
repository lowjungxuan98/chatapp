export { registerPresenceConnectionEvents, activeUsers } from "./connection";
export { registerPresenceCleanupEvents } from "./cleanup";

import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { registerPresenceConnectionEvents } from "./connection";
import { registerPresenceCleanupEvents } from "./cleanup";

export function registerPresenceEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  registerPresenceConnectionEvents(io, socket);
  registerPresenceCleanupEvents();
}
