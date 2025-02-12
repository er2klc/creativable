
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function EmbeddingsManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);

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

  const { data: stats } = useQuery({
    queryKey: ['embedding-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { count: contentCount } = await supabase
        .from('content_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: nexusCount } = await supabase
        .from('nexus_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return {
        contentCount: contentCount || 0,
        nexusCount: nexusCount || 0
      };
    }
  });

  const handleBackfillEmbeddings = async () => {
    try {
      setIsBackfilling(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sie müssen angemeldet sein");
        return;
      }

      const response = await supabase.functions.invoke('backfill-embeddings', {
        body: { }
      });

      if (!response.error) {
        toast.success("Die Verarbeitung bestehender Daten wurde gestartet");
      } else {
        throw response.error;
      }
    } catch (error) {
      console.error('Error backfilling embeddings:', error);
      toast.error("Fehler beim Verarbeiten der bestehenden Daten");
    } finally {
      setIsBackfilling(false);
    }
  };

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

      const response = await supabase.functions.invoke('process-embeddings', {
        body: { }
      });

      if (!response.error) {
        toast.success("Verarbeitung der Daten wurde gestartet");
      } else {
        throw response.error;
      }
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
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          {stats && (
            <div className="text-sm text-muted-foreground">
              Verarbeitete Daten: 
              <ul className="list-disc list-inside mt-2">
                <li>Content Embeddings: {stats.contentCount}</li>
                <li>Nexus Embeddings: {stats.nexusCount}</li>
              </ul>
            </div>
          )}
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button 
              onClick={handleGenerateEmbeddings}
              disabled={isProcessing || !settings?.openai_api_key}
            >
              {isProcessing ? "Wird verarbeitet..." : "Neue Daten verarbeiten"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleBackfillEmbeddings}
              disabled={isBackfilling || !settings?.openai_api_key}
            >
              {isBackfilling ? "Wird verarbeitet..." : "Bestehende Daten verarbeiten"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
