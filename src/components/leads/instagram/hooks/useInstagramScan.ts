import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { ScanState, MediaProcessingState, PollingState } from "./types/scanState";
import { handlePhaseOneProgress, handleMediaProcessing } from "./useProgressPolling";

const initialState: ScanState = {
  isLoading: false,
  scanProgress: 0,
  mediaProgress: 0,
  currentFile: undefined,
  currentPhase: 1,
  isPhaseOneComplete: false,
  isSuccess: false,
  isMediaProcessingActive: false
};

export function useInstagramScan() {
  const [state, setState] = useState<ScanState>(initialState);
  const phaseOneCompletedRef = useRef<boolean>(false);
  const lastProgressRef = useRef<number>(0);
  const { settings } = useSettings();

  const updateState = (updates: Partial<ScanState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const pollProgress = async (leadId: string) => {
    console.log('Starting progress polling for lead:', leadId);
    
    const mediaState: MediaProcessingState = {
      totalFiles: 0,
      processedFiles: 0,
      isActive: false
    };

    const pollingState: PollingState = {
      isActive: true,
      lastProgress: 0,
      simulationInterval: null
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
          .select('processing_progress, bucket_path, media_urls, current_file, media_processing_status')
          .eq('lead_id', leadId)
          .order('processing_progress', { ascending: false });

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        const latestPost = posts && posts.length > 0 ? posts[0] : null;
        if (!latestPost) return;

        const currentProgress = latestPost.processing_progress ?? pollingState.lastProgress;
        
        if (currentProgress < lastProgressRef.current && !phaseOneCompletedRef.current) {
          return;
        }
        lastProgressRef.current = currentProgress;

        if (state.currentPhase === 1 && !phaseOneCompletedRef.current) {
          pollingState.simulationInterval = handlePhaseOneProgress(
            currentProgress,
            pollingState.simulationInterval,
            phaseOneCompletedRef,
            progress => updateState({ scanProgress: progress }),
            complete => updateState({ isPhaseOneComplete: complete }),
            phase => updateState({ currentPhase: phase })
          );
          pollingState.lastProgress = currentProgress;
        }
        
        if (phaseOneCompletedRef.current && !mediaState.isActive && latestPost.media_urls) {
          console.log('Initializing Phase 2: Media Processing');
          mediaState.isActive = true;
          mediaState.totalFiles = latestPost.media_urls.length;
          mediaState.processedFiles = 0;
          updateState({ isMediaProcessingActive: true, mediaProgress: 0 });
          
          if (mediaState.totalFiles === 0) {
            updateState({
              currentFile: "No media files to process",
              mediaProgress: 100,
              isSuccess: true
            });
            pollingState.isActive = false;
            clearInterval(interval);
            toast.success("Contact successfully created");
            return;
          }
        }
        
        if (mediaState.isActive && latestPost.bucket_path) {
          await handleMediaProcessing(
            mediaState,
            latestPost,
            file => updateState({ currentFile: file }),
            progress => updateState({ mediaProgress: progress }),
            success => updateState({ isSuccess: success }),
            pollingState,
            interval
          );
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
    setMediaProgress: (mediaProgress: number) => updateState({ mediaProgress }),
    setCurrentFile: (currentFile?: string) => updateState({ currentFile }),
    setCurrentPhase: (currentPhase: 1 | 2) => updateState({ currentPhase }),
    setIsPhaseOneComplete: (isPhaseOneComplete: boolean) => updateState({ isPhaseOneComplete }),
    setIsSuccess: (isSuccess: boolean) => updateState({ isSuccess }),
    setIsMediaProcessingActive: (isMediaProcessingActive: boolean) => updateState({ isMediaProcessingActive }),
    phaseOneCompletedRef,
    lastProgressRef,
    settings,
    pollProgress
  };
}