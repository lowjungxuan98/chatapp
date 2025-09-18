"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const isBrowser = typeof window !== "undefined";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL; // e.g. https://io.example.com

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isBrowser) return;

    const url = SOCKET_URL ?? window.location.origin;
    const s = io(url, {
      path: "/socket.io",          // 与 server 保持一致
      // 调试 Postman / 仅 WebSocket 场景可打开：
      // transports: ["websocket"],
      // 如果反代用 cookie 粘性，需要：
      // withCredentials: true,
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));
    s.on("response", (msg: string) => console.log("Client", "response", msg));
    s.on("connect_error", (e) => console.warn("connect_error", e.message));

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const sendMessage = (content: string) => socketRef.current?.emit("message", content);
  const emit = (event: string, data?: unknown) => socketRef.current?.emit(event, data);

  return { socket, isConnected, sendMessage, emit };
}