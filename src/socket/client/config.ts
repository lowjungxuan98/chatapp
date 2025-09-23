import { io, Socket } from "socket.io-client";
import type { ServerToClient, ClientToServer } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export type IOSocket = Socket<ServerToClient, ClientToServer>;

export function client(): IOSocket | null {
  if (typeof window === "undefined") return null;
  const url = SOCKET_URL || window.location.origin;
  const s = io(url, {
    path: "/socket.io",
    forceNew: false,
    autoConnect: false, // Let the provider control when to connect
    withCredentials: true,
  });
  return s as IOSocket;
}