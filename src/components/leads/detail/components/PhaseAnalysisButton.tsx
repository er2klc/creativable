
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOpenAIKey } from "@/hooks/use-openai-key";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useRouter } from "react-router-dom";

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
  const router = useRouter();
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
            onClick: () => router.navigate("/settings")
          }
        }
      );
      return;
    }

    onGenerateAnalysis();
  };

  if (isLoadingKey) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {settings?.language === "en" ? "Loading..." : "Lädt..."}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleGenerateClick}
      disabled={isLoading || !user || !phaseId}
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
