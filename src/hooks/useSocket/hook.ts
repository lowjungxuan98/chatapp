"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ClientToServer } from "@/types";
import { createSocketConnection, type IOSocket } from "./connection";
import { setupConnectionEvents, setupMessageEvents, emitMessageEvent, emitGenericEvent } from "./events";
import { useSession } from "next-auth/react";

export function useSocket() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<IOSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState<string>("");
  const socketRef = useRef<IOSocket | null>(null);

  useEffect(() => {
    if (session?.user?.name || session?.user?.email) {
      const sessionUsername = session.user.name || session.user.email || "Anonymous";
      setUsername(sessionUsername);
    }
  }, [session]);

  useEffect(() => {
    const s = createSocketConnection();
    if (!s) return;

    if (session?.user) {
      s.auth = {
        username: session.user.name || session.user.email || "Anonymous",
        userId: session.user.id || session.user.email,
      };
    }

    socketRef.current = s;
    setSocket(s);

    const cleanup = setupConnectionEvents(
      s,
      () => setIsConnected(true),
      () => setIsConnected(false),
      (error) => console.warn("Socket connection error:", error.message)
    );

    setupMessageEvents(s, (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      cleanup();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [session]);

  const handleSendMessage = (content: string) => {
    emitMessageEvent(socketRef.current, content, username);
  };

  const handleEmit = <K extends keyof ClientToServer>(
    event: K, 
    ...args: Parameters<ClientToServer[K]>
  ) => {
    emitGenericEvent(socketRef.current, event, ...args);
  };

  return { 
    socket, 
    isConnected, 
    messages, 
    username, 
    setUsername,
    sendMessage: handleSendMessage, 
    emit: handleEmit 
  };
}
