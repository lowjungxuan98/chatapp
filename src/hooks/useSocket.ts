"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketMessage {
  content: string;
  sender: 'user' | 'server';
  timestamp: Date;
}

export function useSocket(serverUrl: string = 'http://localhost:3000') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const addMessage = (content: string, sender: 'user' | 'server') => {
    setMessages(prev => [...prev, { content, sender, timestamp: new Date() }]);
  };

  const connect = () => {
    if (socketRef.current?.connected) return;
    
    const newSocket = io(serverUrl);
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      addMessage('Connected', 'server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      addMessage('Disconnected', 'server');
    });

    newSocket.on('message', (data) => {
      addMessage(data, 'server');
    });
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setIsConnected(false);
  };

  const sendMessage = (content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', content);
      addMessage(content, 'user');
    }
  };

  const emit = (event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [serverUrl]);

  return {
    socket,
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessage,
    emit,
  };
}
