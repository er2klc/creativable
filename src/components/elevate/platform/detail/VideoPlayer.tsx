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
            controls?: number;
            modestbranding?: number;
            rel?: number;
            origin?: string;
            showinfo?: number;
            fs?: number;
            iv_load_policy?: number;
            disablekb?: number;
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
  const containerRef = useRef<HTMLDivElement>(null);
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

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!isAPILoaded || !containerRef.current) return;

    const videoId = videoUrl.includes('v=') 
      ? videoUrl.split('v=')[1].split('&')[0]
      : videoUrl.split('/').pop();

    if (!videoId) return;

    const playerContainer = document.createElement('div');
    playerContainer.id = playerId;
    playerContainer.style.position = 'absolute';
    playerContainer.style.top = '0';
    playerContainer.style.left = '0';
    playerContainer.style.width = '100%';
    playerContainer.style.height = '100%';
    
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerContainer);
    }

    if (playerRef.current) {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.error('Error destroying player:', error);
      }
    }

    try {
      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1,
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
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
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
    <div ref={containerRef} className="w-full h-full relative" style={{ position: 'relative', paddingTop: '56.25%' }} />
  );
};