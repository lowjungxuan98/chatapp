"use client";

import { useSocket } from "@/socket/client";
import { useSession } from "next-auth/react";

export default function Socket() {
  const socket = useSocket();
  const { data: session, status } = useSession();

  return (
    <div>
      <h1>Socket</h1>
      <h1>{socket?.id || "No socket"}</h1>
      <h1>{socket?.connected ? "Connected" : "Disconnected"}</h1>
      <h1>{session?.user?.name || "No user"}</h1>
      <h1>{status}</h1>
    </div>
  );
}
