import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { PromptEditor } from "./message-dialog/PromptEditor";
import { MessageSquare } from "lucide-react";

interface SendMessageDialogProps {
  lead?: Tables<"leads">;
  trigger?: React.ReactNode;
}

export function SendMessageDialog({ lead, trigger }: SendMessageDialogProps) {
  const { toast } = useToast();
  const session = useSession();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMessage = async (customPrompt?: string) => {
    if (!lead) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-message", {
        body: {
          prompt: customPrompt,
          leadName: lead.name,
          leadPlatform: lead.platform,
          leadIndustry: lead.industry,
          companyName: settings?.company_name,
          productsServices: settings?.products_services,
          targetAudience: settings?.target_audience,
          usp: settings?.usp,
          businessDescription: settings?.business_description,
          language: settings?.language || "de",
        },
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (error) {
      console.error("Error generating message:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Could not generate message" : "Nachricht konnte nicht generiert werden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isDirectMessagePlatform = lead?.platform === "Instagram" || lead?.platform === "Facebook";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {isDirectMessagePlatform
              ? "✨ KI-Nachricht für Erstkontakt"
              : settings?.language === "en"
              ? "Send Message"
              : "Nachricht senden"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {lead ? (
              settings?.language === "en" 
                ? `Create message for ${lead.name}` 
                : `Nachricht für ${lead.name} erstellen`
            ) : (
              settings?.language === "en" ? "Create message" : "Nachricht erstellen"
            )}
          </DialogTitle>
        </DialogHeader>

        {lead && (
          <PromptEditor
            lead={lead}
            settings={settings}
            onGenerate={handleGenerateMessage}
            isGenerating={isGenerating}
            generatedMessage={message}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}