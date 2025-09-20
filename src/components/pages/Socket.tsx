"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket, type ChatMessage } from "@/hooks/useSocket";

export default function Socket() {
  const [message, setMessage] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isConnected, messages, username, setUsername, sendMessage } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleUsernameSubmit = () => {
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim());
      setShowUsernameInput(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Chat Room</h1>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Username:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUsernameInput(!showUsernameInput)}
          >
            {username}
          </Button>
        </div>
      </div>

      {showUsernameInput && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your username..."
                onKeyPress={(e) => e.key === "Enter" && handleUsernameSubmit()}
              />
              <Button onClick={handleUsernameSubmit} disabled={!usernameInput.trim()}>
                Set
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-6">
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg: ChatMessage) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.username === username ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(msg.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col max-w-[70%] ${
                        msg.username === username ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{msg.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg text-sm ${
                          msg.username === username
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={!isConnected}
          className="flex-1"
        />
        <Button 
          onClick={handleSend} 
          disabled={!isConnected || !message.trim()}
          size="lg"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
