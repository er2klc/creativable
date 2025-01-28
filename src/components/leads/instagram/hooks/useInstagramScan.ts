import { useState, useRef } from "react";
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

interface PostData {
  processing_progress: number;
  bucket_path: string | null;
  media_urls: string[];
  current_file: string | null;
  media_processing_status: string;
}

const handlePhaseOne = (
  currentProgress: number,
  simulationInterval: NodeJS.Timeout | null,
  phaseOneCompletedRef: React.RefObject<boolean>,
  setScanProgress: (progress: number) => void,
  setIsPhaseOneComplete: (complete: boolean) => void,
  setCurrentPhase: (phase: 1 | 2) => void
) => {
  if (currentProgress >= 27 && currentProgress < 100 && !simulationInterval) {
    let simulatedProgress = currentProgress;
    const interval = setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 2, 100);
      setScanProgress(simulatedProgress);
      
      if (simulatedProgress >= 100 && !phaseOneCompletedRef.current) {
        console.log('Phase 1 completed, transitioning to Phase 2');
        phaseOneCompletedRef.current = true;
        setIsPhaseOneComplete(true);
        setCurrentPhase(2);
        clearInterval(interval);
      }
    }, 100);
    return interval;
  } else if (currentProgress < 27) {
    setScanProgress(currentProgress);
  }
  return null;
};

const handlePhaseTwo = (
  post: PostData,
  processedMediaFiles: number,
  totalMediaFiles: number,
  setCurrentFile: (file: string) => void,
  setMediaProgress: (progress: number) => void
) => {
  if (post.current_file) {
    setCurrentFile(post.current_file);
  }
  const mediaProgressPercent = Math.min(
    Math.round((processedMediaFiles / (totalMediaFiles || 1)) * 100),
    100
  );
  setMediaProgress(mediaProgressPercent);
  console.log(`Media progress: ${mediaProgressPercent}%, File: ${post.bucket_path}`);
  return mediaProgressPercent;
};

const handleNoMediaFiles = (
  setCurrentFile: (file: string) => void,
  setMediaProgress: (progress: number) => void,
  setIsSuccess: (success: boolean) => void
) => {
  console.log('No media files to process, completing Phase 2');
  setCurrentFile("No media files to process");
  setMediaProgress(100);
  setIsSuccess(true);
  toast.success("Contact successfully created");
  return true;
};

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

  const phaseOneCompletedRef = useRef(false);
  const lastProgressRef = useRef(0);
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
          simulationInterval = handlePhaseOne(
            currentProgress,
            simulationInterval,
            phaseOneCompletedRef,
            progress => updateState({ scanProgress: progress }),
            complete => updateState({ isPhaseOneComplete: complete }),
            phase => updateState({ currentPhase: phase })
          );
          lastProgress = currentProgress;
        }
        
        if (phaseOneCompletedRef.current && !state.isMediaProcessingActive && latestPost.media_urls) {
          updateState({ isMediaProcessingActive: true });
          totalMediaFiles = latestPost.media_urls.length;
          processedMediaFiles = 0;
          updateState({ mediaProgress: 0 });
          
          if (totalMediaFiles === 0) {
            if (handleNoMediaFiles(
              file => updateState({ currentFile: file }),
              progress => updateState({ mediaProgress: progress }),
              success => updateState({ isSuccess: success })
            )) {
              isPollingActive = false;
              clearInterval(interval);
              return;
            }
          }
        }
        
        if (state.isMediaProcessingActive && latestPost.bucket_path) {
          processedMediaFiles++;
          const mediaProgressPercent = handlePhaseTwo(
            latestPost,
            processedMediaFiles,
            totalMediaFiles,
            file => updateState({ currentFile: file }),
            progress => updateState({ mediaProgress: progress })
          );

          if (mediaProgressPercent >= 100 || latestPost.media_processing_status === 'completed') {
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