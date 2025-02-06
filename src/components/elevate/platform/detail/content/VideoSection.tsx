import { VideoPlayer } from '../video/VideoPlayer';
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  useEffect(() => {
    const trackVideoEvent = async (eventType: 'opened' | 'closed', progress: number = 0) => {
      try {
        const response = await fetch('https://api.ipapi.com/check?access_key=YOUR_IPAPI_KEY');
        const ipData = await response.json();
        
        const metadata = {
          type: 'video_event',
          event_type: eventType,
          progress,
          ip_address: ipData.ip,
          city: ipData.city,
          timestamp: new Date().toISOString()
        };

        const { error } = await supabase
          .from('notes')
          .insert({
            lead_id: videoUrl.split('lead/')[1]?.split('/')[0], // Extract lead ID from URL
            content: `Video wurde ${eventType === 'opened' ? 'geöffnet' : `geschlossen bei ${progress}%`}`,
            metadata
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error tracking video event:', error);
      }
    };

    // Track video open
    trackVideoEvent('opened');

    // Track video close
    const handleUnload = () => {
      if (onVideoProgress) {
        const progress = savedProgress || 0;
        trackVideoEvent('closed', progress);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [videoUrl, onVideoProgress, savedProgress]);

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