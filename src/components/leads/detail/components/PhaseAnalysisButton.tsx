
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
    <div className="rounded-lg bg-white p-4 shadow-sm">
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
