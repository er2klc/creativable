import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function EmbeddingsManager() {
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['chatbot-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleGenerateEmbeddings = async () => {
    try {
      setIsProcessing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sie müssen angemeldet sein");
        return;
      }

      if (!settings?.openai_api_key) {
        toast.error("Bitte fügen Sie zuerst Ihren OpenAI API-Schlüssel in den Einstellungen hinzu");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/populate-team-embeddings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: user.id,
            processPersonalData: true 
          })
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Verarbeiten der Daten");
      }

      toast.success("Verarbeitung der Daten wurde gestartet");
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error("Fehler beim Verarbeiten der Daten");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KI-Verarbeitung</CardTitle>
        <CardDescription>
          Verarbeiten Sie Ihre bestehenden Daten mit KI für verbesserte Suchfunktionen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleGenerateEmbeddings}
          disabled={isProcessing || !settings?.openai_api_key}
        >
          {isProcessing ? "Wird verarbeitet..." : "Daten verarbeiten"}
        </Button>
      </CardContent>
    </Card>
  );
}