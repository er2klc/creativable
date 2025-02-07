
import { useEffect, useRef, useState, useCallback } from 'react';
import { DEFAULT_PLAYER_VARS } from './VideoPlayerConfig';

interface UseYouTubePlayerProps {
  videoUrl: string;
  onProgress?: (progress: number) => void;
  savedProgress?: number;
  onDuration?: (duration: number) => void;
  autoplay?: boolean;
}

export const useYouTubePlayer = ({ 
  videoUrl, 
  onProgress, 
  savedProgress = 0,
  onDuration,
  autoplay = false
}: UseYouTubePlayerProps) => {
  const [isAPILoaded, setIsAPILoaded] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number>();
  const savedProgressRef = useRef(savedProgress);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    savedProgressRef.current = savedProgress;
  }, [savedProgress]);

  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        setIsAPILoaded(true);
      };
    } else {
      setIsAPILoaded(true);
    }

    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
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

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;

      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        console.log('Video progress:', progress);
        onProgress?.(progress);
      }
    }, 1000);
  }, [onProgress]);

  const initializePlayer = useCallback((containerElement: HTMLElement) => {
    if (!videoUrl || !isAPILoaded || containerRef.current === containerElement) return;
    
    containerRef.current = containerElement;
    
    const videoId = videoUrl.includes('v=') 
      ? videoUrl.split('v=')[1].split('&')[0]
      : videoUrl.split('/').pop();

    if (!videoId) return;

    const playerId = `youtube-player-${videoId}`;
    const playerContainer = document.createElement('div');
    playerContainer.id = playerId;
    playerContainer.style.position = 'absolute';
    playerContainer.style.top = '0';
    playerContainer.style.left = '0';
    playerContainer.style.width = '100%';
    playerContainer.style.height = '100%';
    
    containerElement.innerHTML = '';
    containerElement.appendChild(playerContainer);

    if (playerRef.current) {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.error('Error destroying player:', error);
      }
    }

    console.log('Creating YouTube player with controls:', DEFAULT_PLAYER_VARS);
    
    playerRef.current = new (window as any).YT.Player(playerId, {
      videoId,
      playerVars: {
        ...DEFAULT_PLAYER_VARS,
        start: Math.floor(savedProgressRef.current),
        autoplay: autoplay ? 1 : 0,
      },
      events: {
        onReady: (event: any) => {
          console.log('YouTube player ready');
          const duration = event.target.getDuration();
          if (onDuration && duration > 0) {
            onDuration(duration);
          }
          if (autoplay) {
            event.target.playVideo();
          }
          startProgressTracking();
        },
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            console.log('Video started playing');
            startProgressTracking();
          } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
            console.log('Video paused');
            if (progressIntervalRef.current) {
              window.clearInterval(progressIntervalRef.current);
            }
          }
        }
      }
    });
  }, [videoUrl, isAPILoaded, onDuration, autoplay, startProgressTracking]);

  return {
    isAPILoaded,
    initializePlayer
  };
};
