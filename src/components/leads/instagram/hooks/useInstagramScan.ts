import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { CheckCircle } from "lucide-react";

export function useInstagramScan() {
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>();
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1);
  const [isPhaseOneComplete, setIsPhaseOneComplete] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMediaProcessingActive, setIsMediaProcessingActive] = useState(false);
  const phaseOneCompletedRef = useRef(false);
  const lastProgressRef = useRef(0);
  const { settings } = useSettings();

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
        console.log('Current progress:', currentProgress, 'Current Phase:', currentPhase, 'Phase One Complete:', isPhaseOneComplete, 'Ref Complete:', phaseOneCompletedRef.current);
        
        if (currentProgress < lastProgressRef.current && !phaseOneCompletedRef.current) {
          console.log('Preventing progress regression:', currentProgress, 'using last progress:', lastProgressRef.current);
          return;
        }
        lastProgressRef.current = currentProgress;

        if (currentPhase === 1 && !phaseOneCompletedRef.current) {
          if (currentProgress >= 27 && currentProgress < 100 && !simulationInterval) {
            let simulatedProgress = currentProgress;
            simulationInterval = setInterval(() => {
              simulatedProgress = Math.min(simulatedProgress + 2, 100);
              setScanProgress(simulatedProgress);
              
              if (simulatedProgress >= 100 && !phaseOneCompletedRef.current) {
                console.log('Phase 1 completed, transitioning to Phase 2');
                phaseOneCompletedRef.current = true;
                setIsPhaseOneComplete(true);
                setCurrentPhase(2);
                if (simulationInterval) {
                  clearInterval(simulationInterval);
                  simulationInterval = null;
                }
              }
            }, 100);
          } else if (currentProgress < 27) {
            setScanProgress(currentProgress);
          }
          lastProgress = currentProgress;
        }
        
        if (phaseOneCompletedRef.current && !isMediaProcessingActive && latestPost.media_urls) {
          console.log('Initializing Phase 2: Media Processing');
          setIsMediaProcessingActive(true);
          totalMediaFiles = latestPost.media_urls.length;
          processedMediaFiles = 0;
          setMediaProgress(0);
          console.log(`Starting media phase, total files: ${totalMediaFiles}`);
          
          if (totalMediaFiles === 0) {
            console.log('No media files to process, completing Phase 2');
            setCurrentFile("No media files to process");
            setMediaProgress(100);
            setIsSuccess(true);
            isPollingActive = false;
            clearInterval(interval);
            toast.success("Contact successfully created", {
              icon: <CheckCircle className="h-5 w-5 text-green-500" />
            });
            return;
          }
        }
        
        if (isMediaProcessingActive && latestPost.bucket_path) {
          processedMediaFiles++;
          if (latestPost.current_file) {
            setCurrentFile(latestPost.current_file);
          }
          const mediaProgressPercent = Math.min(
            Math.round((processedMediaFiles / (totalMediaFiles || 1)) * 100),
            100
          );
          setMediaProgress(mediaProgressPercent);
          console.log(`Media progress: ${mediaProgressPercent}%, File: ${latestPost.bucket_path}`);

          if (mediaProgressPercent >= 100 || latestPost.media_processing_status === 'completed') {
            console.log('Media processing completed');
            setIsSuccess(true);
            isPollingActive = false;
            clearInterval(interval);
            toast.success("Contact successfully created", {
              icon: <CheckCircle className="h-5 w-5 text-green-500" />
            });
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
    isLoading,
    setIsLoading,
    scanProgress,
    setScanProgress,
    mediaProgress,
    setMediaProgress,
    currentFile,
    setCurrentFile,
    currentPhase,
    setCurrentPhase,
    isPhaseOneComplete,
    setIsPhaseOneComplete,
    isSuccess,
    setIsSuccess,
    isMediaProcessingActive,
    setIsMediaProcessingActive,
    phaseOneCompletedRef,
    lastProgressRef,
    settings,
    pollProgress
  };
}