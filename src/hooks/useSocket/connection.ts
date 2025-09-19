import { io, Socket } from "socket.io-client";
import type { ServerToClient, ClientToServer } from "@/types";

const isBrowser = typeof window !== "undefined";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export type IOSocket = Socket<ServerToClient, ClientToServer>;

export function createSocketConnection(): IOSocket | null {
  if (!isBrowser) return null;

  const url = SOCKET_URL ?? window.location.origin;
  return io(url, {
    path: "/socket.io",
  });
}
