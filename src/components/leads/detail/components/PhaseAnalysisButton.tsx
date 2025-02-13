
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhaseAnalysisButtonProps {
  isLoading: boolean;
  leadId: string;
  phaseId: string;
  onGenerateAnalysis: () => void;
}

export function PhaseAnalysisButton({ 
  isLoading,
  leadId,
  phaseId,
  onGenerateAnalysis 
}: PhaseAnalysisButtonProps) {
  const { settings } = useSettings();
  const [analysisExists, setAnalysisExists] = useState(false);
  const [checkingAnalysis, setCheckingAnalysis] = useState(false);

  useEffect(() => {
    const checkAnalysisExists = async () => {
      if (!leadId || !phaseId) {
        console.log('Missing required IDs:', { leadId, phaseId });
        return;
      }

      try {
        console.log('Checking analysis existence for:', {
          leadId,
          phaseId,
          timestamp: new Date().toISOString()
        });

        setCheckingAnalysis(true);
        const { data, error } = await supabase
          .from('phase_based_analyses')
          .select('id')
          .eq('lead_id', leadId)
          .eq('phase_id', phaseId)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking analysis:', error);
          throw error;
        }

        console.log('Analysis check result:', { 
          exists: !!data,
          data,
          timestamp: new Date().toISOString()
        });
        
        setAnalysisExists(!!data);
      } catch (error) {
        console.error('Error checking analysis:', error);
        toast.error(
          settings?.language === "en" 
            ? "Error checking analysis status" 
            : "Fehler beim Prüfen des Analysestatus"
        );
        setAnalysisExists(false);
      } finally {
        setCheckingAnalysis(false);
      }
    };

    checkAnalysisExists();
  }, [leadId, phaseId, settings?.language]);

  console.log('PhaseAnalysisButton render state:', {
    leadId,
    phaseId,
    analysisExists,
    checkingAnalysis,
    isLoading,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="w-full p-4 rounded-lg bg-white shadow-sm">
      {checkingAnalysis ? (
        <Button
          disabled
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {settings?.language === "en" ? "Checking..." : "Prüfe..."}
        </Button>
      ) : (!analysisExists && (
        <Button
          onClick={onGenerateAnalysis}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Bot className="h-4 w-4 mr-2" />
          )}
          {settings?.language === "en" ? "Generate AI Analysis" : "KI Analyse generieren"}
        </Button>
      ))}
    </div>
  );
}
