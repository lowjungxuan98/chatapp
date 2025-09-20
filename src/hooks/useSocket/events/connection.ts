import type { IOSocket } from "../connection";

export function setupConnectionEvents(
  socket: IOSocket,
  onConnect: () => void,
  onDisconnect: () => void,
  onError: (error: Error) => void
) {
  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("connect_error", (e) => onError(new Error(e.message)));

  return () => {
    socket.removeAllListeners();
    socket.disconnect();
  };
}
