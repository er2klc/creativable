
import { useEffect, useRef } from 'react';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (onDuration) {
        onDuration(video.duration);
      }
      if (savedProgress > 0) {
        video.currentTime = (savedProgress / 100) * video.duration;
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100;
        onVideoProgress(progress);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoUrl, onVideoProgress, savedProgress, onDuration]);

  const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  return (
    <div className="col-span-12 lg:col-span-8">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {videoUrl ? (
          isYouTubeUrl ? (
            <iframe
              src={videoUrl.replace('watch?v=', 'embed/')}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="Video Player"
            />
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Kein Video verfügbar
          </div>
        )}
      </div>
    </div>
  );
};
