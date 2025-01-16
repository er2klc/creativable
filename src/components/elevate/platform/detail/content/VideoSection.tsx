import { VideoPlayer } from '../video/VideoPlayer';
import React from 'react';

interface VideoSectionProps {
  videoId: string;
  onProgress?: (progress: number) => void;
  onVideoEnd?: () => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videoId, onProgress, onVideoEnd }) => {
  return (
    <div>
      <VideoPlayer 
        videoId={videoId} 
        onProgress={onProgress} 
        onVideoEnd={onVideoEnd} 
      />
    </div>
  );
};
