import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            modestbranding?: number;
            rel?: number;
            origin?: string;
          };
          events?: {
            onReady?: (event: { target: any }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => void;
      PlayerState: {
        PLAYING: number;
      };
    };
  }
}

interface VideoPlayerProps {
  videoUrl: string;
  onProgress: (progress: number) => void;
  savedProgress?: number;
  onDuration?: (duration: number) => void;
}

export const VideoPlayer = ({ videoUrl, onProgress, savedProgress = 0, onDuration }: VideoPlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAPILoaded, setIsAPILoaded] = useState(false);

  useEffect(() => {
    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPILoaded(true);
      };
    } else {
      setIsAPILoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isAPILoaded || !containerRef.current) return;

    // Extract video ID from URL
    const videoId = videoUrl.includes('v=') 
      ? videoUrl.split('v=')[1].split('&')[0]
      : videoUrl.split('/').pop();

    if (!videoId) return;

    // Initialize player
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          const duration = event.target.getDuration();
          if (onDuration && duration > 0) {
            onDuration(duration);
          }
          if (savedProgress > 0) {
            event.target.seekTo(savedProgress);
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            startTracking(event.target);
          }
        }
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoUrl, isAPILoaded]);

  const startTracking = (player: any) => {
    const trackProgress = setInterval(() => {
      if (!player) return;

      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        onProgress(progress);
        
        // Update duration while playing
        if (onDuration) {
          onDuration(duration);
        }
      }
    }, 1000);

    return () => clearInterval(trackProgress);
  };

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
};