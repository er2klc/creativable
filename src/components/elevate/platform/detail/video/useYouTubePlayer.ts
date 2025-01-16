import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PLAYER_VARS } from './VideoPlayerConfig';

interface UseYouTubePlayerProps {
  videoId: string;
  onProgress?: (progress: number) => void;
  onVideoEnd?: () => void;
}

export const useYouTubePlayer = ({ 
  videoId, 
  onProgress, 
  onVideoEnd 
}: UseYouTubePlayerProps) => {
  const [isAPILoaded, setIsAPILoaded] = useState(false);
  const playerRef = useRef<any>(null);
  const trackingIntervalRef = useRef<number>();
  const playerId = `youtube-player-${videoId}`;

  useEffect(() => {
    const loadYouTubeAPI = () => {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        setIsAPILoaded(true);
      };
    };

    if (!(window as any).YT) {
      loadYouTubeAPI();
    } else {
      setIsAPILoaded(true);
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  const initializePlayer = (containerElement: HTMLElement) => {
    if (!videoId || !isAPILoaded) return;

    const playerContainer = document.createElement('div');
    playerContainer.id = playerId;
    
    containerElement.innerHTML = '';
    containerElement.appendChild(playerContainer);

    if (playerRef.current) {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      playerRef.current.destroy();
    }

    playerRef.current = new (window as any).YT.Player(playerId, {
      videoId,
      playerVars: DEFAULT_PLAYER_VARS,
      events: {
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.ENDED) {
            onVideoEnd?.();
          }
          
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            trackingIntervalRef.current = window.setInterval(() => {
              const currentTime = playerRef.current?.getCurrentTime() || 0;
              const duration = playerRef.current?.getDuration() || 0;
              const progress = (currentTime / duration) * 100;
              onProgress?.(progress);
            }, 1000);
          } else if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
          }
        }
      }
    });
  };

  return {
    isAPILoaded,
    playerId,
    initializePlayer
  };
};