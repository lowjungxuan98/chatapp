"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/useSocket";

export default function Socket() {
  const [message, setMessage] = useState("");
  
  const { isConnected, messages, sendMessage } = useSocket();

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

      <div className="flex gap-2">
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

      <div className="border rounded p-4 h-64 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.timestamp.toString()} className="mb-2">
            <span className={msg.sender === 'user' ? 'text-blue-600' : 'text-gray-600'}>
              {msg.sender}: {msg.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
