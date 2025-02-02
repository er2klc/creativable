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
      lastProgress: 0
    };
    
    const interval = setInterval(async () => {
      if (!pollingState.isActive) {
        clearInterval(interval);
        return;
      }

      try {
        const { data: posts, error } = await supabase
          .from('social_media_posts')
          .select('processing_progress, current_file, error_message')
          .eq('lead_id', leadId)
          .order('processing_progress', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error polling progress:', error);
          toast.error('Error checking scan progress');
          return;
        }

        const latestPost = posts && posts.length > 0 ? posts[0] : null;
        if (!latestPost) return;

        // Check for errors
        if (latestPost.error_message) {
          console.error('Processing error:', latestPost.error_message);
          toast.error(`Error processing posts: ${latestPost.error_message}`);
          pollingState.isActive = false;
          clearInterval(interval);
          return;
        }

        const currentProgress = latestPost.processing_progress ?? pollingState.lastProgress;
        
        if (currentProgress < lastProgressRef.current) {
          return;
        }
        lastProgressRef.current = currentProgress;

        if (latestPost.current_file) {
          updateState({ currentFile: latestPost.current_file });
        }

        if (currentProgress >= 100) {
          updateState({ 
            isSuccess: true,
            scanProgress: 100
          });
          pollingState.isActive = false;
          clearInterval(interval);
          console.log('Instagram scan completed successfully');
        }

      } catch (err) {
        console.error('Error in progress polling:', err);
        toast.error('Error checking scan progress');
      }
    }, 500);

    return () => {
      console.log('Cleaning up progress polling');
      pollingState.isActive = false;
      clearInterval(interval);
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