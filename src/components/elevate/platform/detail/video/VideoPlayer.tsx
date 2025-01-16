import { useEffect, useRef } from 'react';
import { useYouTubePlayer } from './useYouTubePlayer';
import { CONTAINER_STYLES } from './VideoPlayerConfig';

interface VideoPlayerProps {
  videoId: string;
  onProgress?: (progress: number) => void;
  onVideoEnd?: () => void;
}

export const VideoPlayer = ({ 
  videoId, 
  onProgress, 
  onVideoEnd 
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAPILoaded, initializePlayer } = useYouTubePlayer({
    videoId,
    onProgress,
    onVideoEnd
  });

  useEffect(() => {
    if (isAPILoaded && containerRef.current) {
      initializePlayer(containerRef.current);
    }
  }, [isAPILoaded, videoId, initializePlayer]);

  if (!videoId) return null;

  return (
    <div 
      ref={containerRef} 
      style={CONTAINER_STYLES}
      className="rounded-lg overflow-hidden bg-black/5"
    />
  );
};