
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnloadHandler = (viewId: string | null) => {
  useEffect(() => {
    const handleUnload = async () => {
      if (viewId) {
        console.log('Handling video unload for viewId:', viewId);
        
        const metadata = {
          type: 'youtube',
          event_type: 'video_closed'
        };

        try {
          // First try using sendBeacon
          const beaconData = JSON.stringify({ 
            completed: false,
            metadata 
          });
          
          const beaconSuccess = navigator.sendBeacon(
            `${window.location.origin}/api/presentation-view/${viewId}`,
            beaconData
          );

          if (!beaconSuccess) {
            // Fallback to direct Supabase update if sendBeacon fails
            await supabase
              .from('presentation_views')
              .update({
                completed: false,
                metadata
              })
              .eq('id', viewId);
          }
        } catch (error) {
          console.error('Error in unload handler:', error);
        }
      }
    };
    
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [viewId]);
};
