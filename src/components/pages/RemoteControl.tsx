import { Android } from '@/components/ui/shadcn-io/android';

export default function RemoteControl() {
  return (
    <div className="flex justify-center">
      <Android
        className="h-full w-auto"
        videoSrc="https://videos.pexels.com/video-files/14993748/14993748-uhd_1296_2304_30fps.mp4"
      />
    </div>
  );
}
