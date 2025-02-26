
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOpenAIKey } from "@/hooks/use-openai-key";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useNavigate } from "react-router-dom";

interface PhaseAnalysisButtonProps {
  isLoading: boolean;
  leadId: string;
  phaseId: string;
  onGenerateAnalysis: () => void;
}

export const PhaseAnalysisButton = ({
  isLoading,
  leadId,
  phaseId,
  onGenerateAnalysis
}: PhaseAnalysisButtonProps) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { apiKey } = useOpenAIKey();
  const navigate = useNavigate();
  const [isLoadingKey, setIsLoadingKey] = useState(false);

  const handleGenerateClick = async () => {
    if (!apiKey) {
      toast.error(
        settings?.language === "en"
          ? "Please configure your OpenAI API key in settings"
          : "Bitte konfigurieren Sie Ihren OpenAI API-Key in den Einstellungen",
        {
          action: {
            label: settings?.language === "en" ? "Go to Settings" : "Zu Einstellungen",
            onClick: () => navigate("/settings")
          }
        }
      );
      return;
    }

    console.log("Starting analysis generation with:", {
      leadId,
      phaseId,
      hasApiKey: !!apiKey
    });

    onGenerateAnalysis();
  };

  if (isLoadingKey) {
    return (
      <Button variant="secondary" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {settings?.language === "en" ? "Loading..." : "Lädt..."}
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      onClick={handleGenerateClick}
      disabled={isLoading || !user || !phaseId}
      className="bg-blue-500 hover:bg-blue-600 text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {settings?.language === "en" ? "Generating..." : "Generiere..."}
        </>
      ) : (
        settings?.language === "en" ? "Generate Analysis" : "Analyse generieren"
      )}
    </Button>
  );
};
