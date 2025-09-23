"use client";

import { Android } from '@/components/ui/shadcn-io/android';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/socket/client';
import { useEffect, useState } from 'react';

export default function RemoteControl() {
  const socket = useSocket();
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  useEffect(() => {
    socket?.emit("remote");
    socket?.on("remotechannel", (roomName) => console.log(roomName));
  }, [socket]);

  const handleTap = () => socket?.emit("tap", { x, y });

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4 items-center">
        <Input
          type="number"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          placeholder="X"
          className="w-20"
        />
        <Input
          type="number"
          value={y}
          onChange={(e) => setY(Number(e.target.value))}
          placeholder="Y"
          className="w-20"
        />
        <Button onClick={handleTap}>Tap</Button>
      </div>
      <Android
        className="h-full w-auto"
        videoSrc="https://videos.pexels.com/video-files/14993748/14993748-uhd_1296_2304_30fps.mp4"
      />
    </div>
  );
}
