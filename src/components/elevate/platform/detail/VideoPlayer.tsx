import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  onProgress: (progress: number) => void;
  savedProgress?: number;
}

export const VideoPlayer = ({ videoUrl, onProgress, savedProgress = 0 }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<any>(null);
  
  useEffect(() => {
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Extract video ID from URL
    const videoId = videoUrl.split('v=')[1];
    
    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new (window as any).YT.Player(iframeRef.current, {
        videoId,
        events: {
          onReady: (event: any) => {
            if (savedProgress > 0) {
              event.target.seekTo(savedProgress);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              startTracking(event.target);
            }
          }
        }
      });
      setPlayer(newPlayer);
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoUrl]);

  const startTracking = (player: any) => {
    const trackProgress = setInterval(() => {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      const progress = (currentTime / duration) * 100;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(trackProgress);
      }
    }, 1000);

    return () => clearInterval(trackProgress);
  };

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <div ref={iframeRef} className="w-full h-full" />
    </div>
  );
};