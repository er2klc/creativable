
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnloadHandler = (viewId: string | null) => {
  useEffect(() => {
    const handleUnload = () => {
      if (viewId) {
        console.log('Handling unload for viewId:', viewId);
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

        // Also update directly in Supabase as fallback
        try {
          supabase
            .from('presentation_views')
            .update({
              metadata
            })
            .eq('id', viewId)
            .then(({ error }) => {
              if (error) console.error('Error updating view on unload:', error);
            });
        } catch (error) {
          console.error('Error in unload handler:', error);
        }
      }
    };
    
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [viewId]);
};
