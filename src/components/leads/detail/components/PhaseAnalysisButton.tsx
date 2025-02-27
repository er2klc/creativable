
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

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

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
      <h3 className="text-md font-medium mb-2">
        {settings?.language === "en" ? "Phase Analysis" : "Phasenanalyse"}
      </h3>
      <p className="text-sm text-gray-500 mb-3">
        {settings?.language === "en" 
          ? "Generate an AI analysis based on the current phase position"
          : "Generiere eine KI-Analyse basierend auf der aktuellen Phasenposition"}
      </p>
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
    </div>
  );
}
