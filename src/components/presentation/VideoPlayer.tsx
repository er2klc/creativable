import { useRef, useEffect } from 'react';

export interface VideoPlayerProps {
  videoUrl: string;
  onProgress: (progress: number) => void;
  autoplay?: boolean;
  initialProgress?: number;
}

export function VideoPlayer({ videoUrl, onProgress, autoplay = false, initialProgress = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      onProgress(progress);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [onProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialProgress) return;

    const handleLoadedMetadata = () => {
      video.currentTime = (initialProgress / 100) * video.duration;
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [initialProgress]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      autoPlay={autoplay}
      className="w-full h-full object-contain"
    />
  );
}