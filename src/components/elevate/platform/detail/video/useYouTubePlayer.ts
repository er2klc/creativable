import { useEffect, useRef, useState, useCallback } from 'react';
import { DEFAULT_PLAYER_VARS } from './VideoPlayerConfig';

interface UseYouTubePlayerProps {
  videoUrl: string;
  onProgress?: (progress: number) => void;
  savedProgress?: number;
  onDuration?: (duration: number) => void;
}

export const useYouTubePlayer = ({ 
  videoUrl, 
  onProgress, 
  savedProgress,
  onDuration 
}: UseYouTubePlayerProps) => {
  const [isAPILoaded, setIsAPILoaded] = useState(false);
  const playerRef = useRef<any>(null);
  const trackingIntervalRef = useRef<number>();

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

  const initializePlayer = useCallback((containerElement: HTMLElement) => {
    if (!videoUrl || !isAPILoaded) return;

    const videoId = videoUrl.includes('v=') 
      ? videoUrl.split('v=')[1].split('&')[0]
      : videoUrl.split('/').pop();

    if (!videoId) return;

    const playerId = `youtube-player-${videoId}`;
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
        onReady: (event: any) => {
          const duration = event.target.getDuration();
          if (onDuration && duration > 0) {
            onDuration(duration);
          }
          if (savedProgress && savedProgress > 0) {
            event.target.seekTo(savedProgress);
          }
        },
        onStateChange: (event: any) => {
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
  }, [videoUrl, isAPILoaded, onProgress, savedProgress, onDuration]);

  return {
    isAPILoaded,
    initializePlayer
  };
};