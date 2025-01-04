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
            onStateChange?: (event: { target: any; data: number }) => void;
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
  const [isAPILoaded, setIsAPILoaded] = useState(false);
  const playerId = 'youtube-player';
  const savedProgressRef = useRef(savedProgress);
  const onDurationRef = useRef(onDuration);
  const trackingIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    savedProgressRef.current = savedProgress;
    onDurationRef.current = onDuration;
  }, [savedProgress, onDuration]);

  useEffect(() => {
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
    if (!isAPILoaded) return;

    const videoId = videoUrl.includes('v=') 
      ? videoUrl.split('v=')[1].split('&')[0]
      : videoUrl.split('/').pop();

    if (!videoId) return;

    // Cleanup existing player and interval
    if (playerRef.current) {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(playerId, {
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
          if (onDurationRef.current && duration > 0) {
            onDurationRef.current(duration);
          }
          if (savedProgressRef.current > 0) {
            event.target.seekTo(savedProgressRef.current);
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
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoUrl, isAPILoaded]);

  const startTracking = (player: any) => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    trackingIntervalRef.current = setInterval(() => {
      if (!player) return;

      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        onProgress(progress);
        
        if (onDurationRef.current) {
          onDurationRef.current(duration);
        }
      }
    }, 1000);

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  };

  return (
    <div id={playerId} className="w-full h-full" />
  );
};