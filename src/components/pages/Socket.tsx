"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/useSocket";

export default function Socket() {
  const [message, setMessage] = useState("");

  const { isConnected, sendMessage } = useSocket();

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Socket Test</h1>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        disabled={!isConnected}
      />
      <Button onClick={handleSend} disabled={!isConnected || !message.trim()}>
        Send
      </Button>
    </div>
  );
}
