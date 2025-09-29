"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { client } from "@/socket/client/config";
import { Socket } from "socket.io-client";
import { ClientToServer, ServerToClient } from "@/types/socket";

interface SocketContextType {
  socket: Socket<ServerToClient, ClientToServer> | null;
  isConnected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket<ServerToClient, ClientToServer> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket<ServerToClient, ClientToServer> | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      // Clean up existing socket if user is not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      setError(null);
      return;
    }

    // Don't create a new socket if one already exists and is connected
    if (socketRef.current?.connected) return;

    // Create socket connection with session data
    const socketClient = client(
      undefined, // use default URL
      undefined, // use default options
      {
        userId: session?.user?.id || 'anonymous',
        username: session?.user?.name || session?.user?.email || 'Anonymous User',
      }
    );
    socketRef.current = socketClient;
    setSocket(socketClient);

    // Connection event handlers
    socketClient.on("connect", () => {
      console.log("Socket connected:", socketClient.id);
      setIsConnected(true);
      setError(null);
    });

    socketClient.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketClient.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError(err.message);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      setError(null);
    };
  }, [session, status]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
}

export function useSocketStatus() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocketStatus must be used within a SocketProvider");
  }
  return {
    isConnected: context.isConnected,
    error: context.error,
  };
}
