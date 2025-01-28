import { useState, useRef, MutableRefObject } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";

interface ScanState {
  isLoading: boolean;
  scanProgress: number;
  mediaProgress: number;
  currentFile?: string;
  currentPhase: 1 | 2;
  isPhaseOneComplete: boolean;
  isSuccess: boolean;
  isMediaProcessingActive: boolean;
}

export function useInstagramScan() {
  const [state, setState] = useState<ScanState>({
    isLoading: false,
    scanProgress: 0,
    mediaProgress: 0,
    currentFile: undefined,
    currentPhase: 1,
    isPhaseOneComplete: false,
    isSuccess: false,
    isMediaProcessingActive: false
  });

  // Explicitly type the refs as MutableRefObject
  const phaseOneCompletedRef: MutableRefObject<boolean> = useRef(false);
  const lastProgressRef: MutableRefObject<number> = useRef(0);
  const { settings } = useSettings();

  const updateState = (updates: Partial<ScanState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const pollProgress = async (leadId: string) => {
    console.log('Starting progress polling for lead:', leadId);
    let lastProgress = 0;
    let totalMediaFiles = 0;
    let processedMediaFiles = 0;
    let simulationInterval: NodeJS.Timeout | null = null;
    let isPollingActive = true;
    
    const interval = setInterval(async () => {
      if (!isPollingActive) {
        if (simulationInterval) clearInterval(simulationInterval);
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

        const currentProgress = latestPost.processing_progress ?? lastProgress;
        
        if (currentProgress < lastProgressRef.current && !phaseOneCompletedRef.current) {
          return;
        }
        lastProgressRef.current = currentProgress;

        if (state.currentPhase === 1 && !phaseOneCompletedRef.current) {
          if (currentProgress >= 27 && currentProgress < 100 && !simulationInterval) {
            let simulatedProgress = currentProgress;
            simulationInterval = setInterval(() => {
              simulatedProgress = Math.min(simulatedProgress + 2, 100);
              updateState({ scanProgress: simulatedProgress });
              
              if (simulatedProgress >= 100 && !phaseOneCompletedRef.current) {
                console.log('Phase 1 completed, transitioning to Phase 2');
                phaseOneCompletedRef.current = true;
                updateState({
                  isPhaseOneComplete: true,
                  currentPhase: 2
                });
                if (simulationInterval) {
                  clearInterval(simulationInterval);
                  simulationInterval = null;
                }
              }
            }, 100);
          } else if (currentProgress < 27) {
            updateState({ scanProgress: currentProgress });
          }
          lastProgress = currentProgress;
        }
        
        if (phaseOneCompletedRef.current && !state.isMediaProcessingActive && latestPost.media_urls) {
          console.log('Initializing Phase 2: Media Processing');
          updateState({ isMediaProcessingActive: true, mediaProgress: 0 });
          totalMediaFiles = latestPost.media_urls.length;
          processedMediaFiles = 0;
          
          if (totalMediaFiles === 0) {
            console.log('No media files to process, completing Phase 2');
            updateState({
              currentFile: "No media files to process",
              mediaProgress: 100,
              isSuccess: true
            });
            isPollingActive = false;
            clearInterval(interval);
            toast.success("Contact successfully created");
            return;
          }
        }
        
        if (state.isMediaProcessingActive && latestPost.bucket_path) {
          processedMediaFiles++;
          if (latestPost.current_file) {
            updateState({ currentFile: latestPost.current_file });
          }
          const mediaProgressPercent = Math.min(
            Math.round((processedMediaFiles / (totalMediaFiles || 1)) * 100),
            100
          );
          updateState({ mediaProgress: mediaProgressPercent });

          if (mediaProgressPercent >= 100 || latestPost.media_processing_status === 'completed') {
            console.log('Media processing completed');
            updateState({ isSuccess: true });
            isPollingActive = false;
            clearInterval(interval);
            toast.success("Contact successfully created");
          }
        }
      } catch (err) {
        console.error('Error in progress polling:', err);
      }
    }, 500);

    return () => {
      console.log('Cleaning up progress polling');
      isPollingActive = false;
      clearInterval(interval);
      if (simulationInterval) {
        clearInterval(simulationInterval);
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