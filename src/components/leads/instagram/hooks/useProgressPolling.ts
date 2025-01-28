import { MutableRefObject } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaProcessingState, PollingState } from "./types";

export const handlePhaseOneProgress = (
  currentProgress: number,
  simulationInterval: NodeJS.Timeout | null,
  phaseOneCompletedRef: MutableRefObject<boolean>,
  setScanProgress: (progress: number) => void,
  setIsPhaseOneComplete: (complete: boolean) => void,
  setCurrentPhase: (phase: 1 | 2) => void
) => {
  if (currentProgress >= 27 && currentProgress < 100 && !simulationInterval) {
    let simulatedProgress = currentProgress;
    return setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 2, 100);
      setScanProgress(simulatedProgress);
      
      if (simulatedProgress >= 100 && !phaseOneCompletedRef.current) {
        console.log('Phase 1 completed, transitioning to Phase 2');
        phaseOneCompletedRef.current = true;
        setIsPhaseOneComplete(true);
        setCurrentPhase(2);
      }
    }, 100);
  } else if (currentProgress < 27) {
    setScanProgress(currentProgress);
  }
  return null;
};

export const handleMediaProcessing = (
  mediaState: MediaProcessingState,
  latestPost: any,
  setCurrentFile: (file: string) => void,
  setMediaProgress: (progress: number) => void,
  setIsSuccess: (success: boolean) => void,
  pollingState: PollingState,
  interval: NodeJS.Timeout
) => {
  if (!mediaState.isActive) return false;

  mediaState.processedFiles++;
  if (latestPost.current_file) {
    setCurrentFile(latestPost.current_file);
  }

  const mediaProgressPercent = Math.min(
    Math.round((mediaState.processedFiles / (mediaState.totalFiles || 1)) * 100),
    100
  );
  setMediaProgress(mediaProgressPercent);

  if (mediaProgressPercent >= 100 || latestPost.media_processing_status === 'completed') {
    console.log('Media processing completed');
    setIsSuccess(true);
    pollingState.isActive = false;
    clearInterval(interval);
    toast.success("Contact successfully created");
    return true;
  }
  return false;
};