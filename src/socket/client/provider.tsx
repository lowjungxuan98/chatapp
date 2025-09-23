"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { IOSocket } from "@/socket/client";
import { client } from "@/socket/client";
import { useSession } from "next-auth/react";

const SocketContext = createContext<IOSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<IOSocket | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      setSocket((prev) => {
        prev?.close();
        return null;
      });
      return;
    }
    const s = client();
    if (s) {
      if (session?.user) {
        s.auth = {
          username: session?.user?.name,
          userId: session?.user?.id,
        };
      }
      
      const onConnect = () => {
        setSocket(s);
      };
      
      const onDisconnect = () => {
        setSocket(null);
      };

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.connect();

      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.close();
        setSocket(null);
      };
    }
  }, [status, session?.user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
