import { VideoPlayer } from '../video/VideoPlayer';
import React from 'react';

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
      <div className="rounded-lg overflow-hidden bg-black/5">
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