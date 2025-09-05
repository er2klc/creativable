import * as React from 'react';
import { VideoPlayer } from '../video/VideoPlayer';

interface VideoSectionProps {
  videoUrl: string;
  onVideoProgress?: (progress: number) => void;
  savedProgress?: number;
  onDuration?: (duration: number) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ 
  videoUrl, 
  onVideoProgress, 
  savedProgress,
  onDuration 
}) => {
  return (
    <div className="col-span-12 lg:col-span-8">
      <div className="w-full h-full rounded-lg overflow-hidden bg-black/5">
        <VideoPlayer 
          videoUrl={videoUrl} 
          onProgress={onVideoProgress} 
          savedProgress={savedProgress}
          onDuration={onDuration}
        />
      </div>
    </div>
  );
};