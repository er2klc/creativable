
import { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';

interface VideoSectionProps {
  videoUrl: string;
  onVideoProgress: (progress: number) => void;
  savedProgress?: number;
  onDuration?: (duration: number) => void;
}

export const VideoSection = ({
  videoUrl,
  onVideoProgress,
  savedProgress = 0,
  onDuration = () => {}
}: VideoSectionProps) => {
  const playerRef = useRef<ReactPlayer>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const progressTracking = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleStart = () => {
    progressTracking.current = true;
    
    // Start tracking progress
    if (!progressInterval.current) {
      progressInterval.current = setInterval(() => {
        if (progressTracking.current && playerRef.current) {
          const player = playerRef.current;
          const duration = player.getDuration();
          const currentTime = player.getCurrentTime();
          if (duration > 0) {
            const progressPercent = (currentTime / duration) * 100;
            onVideoProgress(progressPercent);
            localStorage.setItem(`video-progress-${videoUrl}`, progressPercent.toString());
          }
        }
      }, 5000); // Update progress every 5 seconds
    }
  };

  const handlePause = () => {
    progressTracking.current = false;
  };

  const handleEnded = () => {
    progressTracking.current = false;
    onVideoProgress(100);
    localStorage.setItem(`video-progress-${videoUrl}`, '100');
  };

  const handleDuration = (duration: number) => {
    onDuration(duration);
  };

  const handleReady = () => {
    if (savedProgress && savedProgress > 0 && playerRef.current) {
      const duration = playerRef.current.getDuration();
      const seekTime = (savedProgress / 100) * duration;
      playerRef.current.seekTo(seekTime, 'seconds');
    }
  };

  return (
    <div className="col-span-12 lg:col-span-8">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {videoUrl ? (
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            playing={false}
            onStart={handleStart}
            onPlay={handleStart}
            onPause={handlePause}
            onEnded={handleEnded}
            onDuration={handleDuration}
            onReady={handleReady}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0
                }
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Kein Video verfügbar
          </div>
        )}
      </div>
    </div>
  );
};
