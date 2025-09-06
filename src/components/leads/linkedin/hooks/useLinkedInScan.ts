import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";

interface ScanState {
  isLoading: boolean;
  scanProgress: number;
  currentFile?: string;
  isSuccess: boolean;
}

const initialState: ScanState = {
  isLoading: false,
  scanProgress: 0,
  currentFile: undefined,
  isSuccess: false
};

type Vars = { leadId: string };
type Res = { queued: boolean; taskId?: string };

export function useLinkedInScan() {
  const [state, setState] = useState<ScanState>(initialState);
  const lastProgressRef = useRef<number>(0);
  const { settings } = useSettings();

  const updateState = (updates: Partial<ScanState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const scanMutation = useMutation<Res, Error, Vars>({
    mutationFn: async ({ leadId }) => {
      const { data, error } = await supabase
        .from("linkedin_scan_jobs")
        .insert({ lead_id: leadId })
        .select("id")
        .single();
      if (error) throw error;
      return { queued: true, taskId: (data as any)?.id as string | undefined };
    },
  });

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
        const { data: scanHistory, error } = await supabase
          .from('linkedin_scan_jobs')
          .select('status,created_at')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        if (scanHistory) {
          // Simulate progress based on time elapsed
          const now = Date.now();
          const elapsed = now - new Date(scanHistory.created_at).getTime();
          const progress = Math.min(100, Math.floor(elapsed / 300)); // 30 seconds = 100%
          
          if (progress < lastProgressRef.current) {
            return;
          }
          lastProgressRef.current = progress;

          updateState({ 
            scanProgress: progress,
            currentFile: 'Scanning LinkedIn profile...'
          });

          if (progress >= 100 || scanHistory.status === 'completed') {
            updateState({ isSuccess: true });
            pollingState.isActive = false;
            clearInterval(interval);
          }
        }

      } catch (err) {
        console.error('Error in progress polling:', err);
      }
    }, 1000);

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
    pollProgress,
    startScan: (leadId: string) => scanMutation.mutate({ leadId })
  };
}