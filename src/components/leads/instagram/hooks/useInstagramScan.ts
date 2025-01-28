import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { ScanState } from "./types/scanState";

const initialState: ScanState = {
  isLoading: false,
  scanProgress: 0,
  currentFile: undefined,
  isSuccess: false
};

export function useInstagramScan() {
  const [state, setState] = useState<ScanState>(initialState);
  const lastProgressRef = useRef<number>(0);
  const { settings } = useSettings();

  const updateState = (updates: Partial<ScanState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const pollProgress = async (leadId: string) => {
    console.log('Starting progress polling for lead:', leadId);
    
    const pollingState = {
      isActive: true,
      lastProgress: 0,
      simulationInterval: null as NodeJS.Timeout | null
    };
    
    const interval = setInterval(async () => {
      if (!pollingState.isActive) {
        if (pollingState.simulationInterval) clearInterval(pollingState.simulationInterval);
        clearInterval(interval);
        return;
      }

      try {
        const { data: posts, error } = await supabase
          .from('social_media_posts')
          .select('processing_progress, current_file')
          .eq('lead_id', leadId)
          .order('processing_progress', { ascending: false });

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        const latestPost = posts && posts.length > 0 ? posts[0] : null;
        if (!latestPost) return;

        const currentProgress = latestPost.processing_progress ?? pollingState.lastProgress;
        
        if (currentProgress < lastProgressRef.current) {
          return;
        }
        lastProgressRef.current = currentProgress;

        updateState({ 
          scanProgress: currentProgress,
          currentFile: latestPost.current_file
        });

        if (currentProgress >= 100) {
          updateState({ isSuccess: true });
          pollingState.isActive = false;
          clearInterval(interval);
        }

      } catch (err) {
        console.error('Error in progress polling:', err);
      }
    }, 500);

    return () => {
      console.log('Cleaning up progress polling');
      pollingState.isActive = false;
      clearInterval(interval);
      if (pollingState.simulationInterval) {
        clearInterval(pollingState.simulationInterval);
      }
    };
  };

  return {
    ...state,
    setIsLoading: (isLoading: boolean) => updateState({ isLoading }),
    setScanProgress: (scanProgress: number) => updateState({ scanProgress }),
    setCurrentFile: (currentFile?: string) => updateState({ currentFile }),
    setIsSuccess: (isSuccess: boolean) => updateState({ isSuccess }),
    lastProgressRef,
    settings,
    pollProgress
  };
}