
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOpenAIKey } from "@/hooks/use-openai-key";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { processContentForEmbeddings } from "@/utils/embeddings";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const EmbeddingsManager = () => {
  const { apiKey } = useOpenAIKey();
  const { user } = useAuth();
  const [processing, setProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const processUserData = async () => {
    if (!apiKey || !user) {
      toast.error("OpenAI API Key ist erforderlich");
      return;
    }

    try {
      setProcessing(true);
      setStatus("Hole Benutzer Daten...");

      // Process profile information
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setStatus("Verarbeite Profil Daten...");
        await processContentForEmbeddings(
          `Benutzername: ${profile.display_name || "Nicht angegeben"}
           Bio: ${profile.bio || "Keine Biografie angegeben"}
           Status: ${profile.status || "Kein Status"}`,
          "profile",
          { sourceType: "profile", sourceId: user.id }
        );
      }

      // Process leads
      setStatus("Verarbeite Kontakte...");
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id);

      if (leads && leads.length > 0) {
        for (const lead of leads) {
          await processContentForEmbeddings(
            `Kontakt: ${lead.name}
             Firma: ${lead.company_name || "Nicht angegeben"}
             Branche: ${lead.industry || "Nicht angegeben"}
             Position: ${lead.position || "Nicht angegeben"}
             Bio: ${lead.social_media_bio || "Keine Bio"}`,
            "lead",
            { sourceType: "lead", sourceId: lead.id }
          );
        }
      }

      // Process notes
      setStatus("Verarbeite Notizen...");
      const { data: notes } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id);

      if (notes && notes.length > 0) {
        for (const note of notes) {
          await processContentForEmbeddings(
            note.content,
            "note",
            { sourceType: "note", sourceId: note.id, leadId: note.lead_id }
          );
        }
      }

      // Process settings
      setStatus("Verarbeite Einstellungen...");
      const { data: settings } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settings) {
        await processContentForEmbeddings(
          `Firmenname: ${settings.company_name || "Nicht angegeben"}
           Produkte/Dienstleistungen: ${settings.products_services || "Nicht angegeben"}
           Zielgruppe: ${settings.target_audience || "Nicht angegeben"}
           Business-Beschreibung: ${settings.business_description || "Nicht angegeben"}`,
          "settings",
          { sourceType: "settings", sourceId: settings.id }
        );
      }

      toast.success("Daten erfolgreich für die KI vorbereitet!");
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Embeddings:", error);
      toast.error("Fehler beim Verarbeiten der Daten");
    } finally {
      setProcessing(false);
      setStatus("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>KI-Datenverarbeitung</CardTitle>
        <CardDescription>
          Bereite deine Daten für den Nexus-Assistenten vor, damit er personalisierte Antworten geben kann.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Klicke auf den Button, um deine Benutzerdaten für die KI zu verarbeiten. 
          Dies ermöglicht dem Nexus-Assistenten, bessere und personalisierte Antworten zu geben.
        </p>
        {status && <p className="text-sm text-primary mb-2">{status}</p>}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={processUserData} 
          disabled={processing || !apiKey}
        >
          {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {processing ? 'Verarbeite...' : 'Daten für KI verarbeiten'}
        </Button>
      </CardFooter>
    </Card>
  );
};
