
import { useEffect } from 'react';

export const useUnloadHandler = (viewId: string | null) => {
  useEffect(() => {
    const handleUnload = () => {
      if (viewId) {
        const metadata = {
          type: 'youtube',
          event_type: 'video_closed'
        };

        navigator.sendBeacon(
          `${window.location.origin}/api/presentation-view/${viewId}`,
          JSON.stringify({ 
            completed: false,
            metadata 
          })
        );
      }
    };
    
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [viewId]);
};
