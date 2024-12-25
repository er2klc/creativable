import { useState } from "react";
import { Settings } from "@/integrations/supabase/types/settings";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromptEditorProps {
  lead: Tables<"leads">;
  settings?: Settings;
  onGenerate: (customPrompt?: string) => void;
  isGenerating: boolean;
  generatedMessage: string;
}

export function PromptEditor({
  lead,
  settings,
  onGenerate,
  isGenerating,
  generatedMessage,
}: PromptEditorProps) {
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const defaultPrompt = `Erstelle eine personalisierte Erstkontakt-Nachricht für ${lead.name} mit folgenden Informationen:

Über mich:
${settings?.about_me || ""}

Geschäftsinformationen:
- Firma: ${settings?.company_name || ""}
- Produkte/Services: ${settings?.products_services || ""}
- Zielgruppe: ${settings?.target_audience || ""}
- USP: ${settings?.usp || ""}
- Business Description: ${settings?.business_description || ""}

Kontaktinformationen:
- Plattform: ${lead.platform}
- Branche: ${lead.industry || "nicht angegeben"}
- Firma: ${lead.company_name || "nicht angegeben"}
- Email: ${lead.email || "nicht angegeben"}
- Telefon: ${lead.phone_number || "nicht angegeben"}
${lead.social_media_bio ? `- Profil Bio: ${lead.social_media_bio}` : ""}
${lead.social_media_interests?.length ? `- Interessen: ${lead.social_media_interests.join(", ")}` : ""}

Die Nachricht sollte:
- Kurz und prägnant sein (max. 2-3 Sätze)
- Freundlich und persönlich klingen
- Einen klaren Call-to-Action enthalten`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast({
        title: settings?.language === "en"
          ? "Message copied to clipboard"
          : "Nachricht in die Zwischenablage kopiert",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: settings?.language === "en"
          ? "Failed to copy message"
          : "Fehler beim Kopieren der Nachricht",
        variant: "destructive",
      });
    }
  };

  const isDirectMessagePlatform = lead.platform === "Instagram" || lead.platform === "Facebook";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPrompt(!showPrompt)}
        >
          {showPrompt
            ? settings?.language === "en"
              ? "Hide Prompt"
              : "Prompt ausblenden"
            : settings?.language === "en"
            ? "Show Prompt"
            : "Prompt anzeigen"}
        </Button>
      </div>

      {showPrompt && (
        <div className="space-y-2">
          <Textarea
            value={customPrompt || defaultPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={10}
            className="font-mono text-sm leading-relaxed"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => onGenerate(customPrompt || defaultPrompt)}
          disabled={isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {settings?.language === "en" ? "Generating..." : "Generiere..."}
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              {isDirectMessagePlatform
                ? "✨ KI-Nachricht für Erstkontakt generieren"
                : settings?.language === "en"
                ? "Generate Message"
                : "Nachricht generieren"}
            </>
          )}
        </Button>

        {generatedMessage && (
          <Button onClick={copyToClipboard} variant="outline">
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>

      {generatedMessage && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="whitespace-pre-wrap">{generatedMessage}</p>
        </div>
      )}
    </div>
  );
}