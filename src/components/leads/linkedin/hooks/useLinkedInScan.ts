import { useState, useRef } from "react";
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

export function useLinkedInScan() {
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
        const { data: scanHistory, error } = await supabase
          .from('social_media_scan_history')
          .select('*')
          .eq('lead_id', leadId)
          .eq('platform', 'LinkedIn')
          .order('scanned_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        if (scanHistory) {
          const progress = scanHistory.success ? 100 : 50;
          
          if (progress < lastProgressRef.current) {
            return;
          }
          lastProgressRef.current = progress;

          updateState({ 
            scanProgress: progress,
            currentFile: 'Scanning LinkedIn profile...'
          });

          if (progress >= 100) {
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
    pollProgress
  };
}