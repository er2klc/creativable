import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { processUserDataForEmbeddings, processTeamDataForEmbeddings } from "@/utils/embeddings";

export function EmbeddingsManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [isProcessingUserData, setIsProcessingUserData] = useState(false);
  const [isProcessingTeamData, setIsProcessingTeamData] = useState(false);
  const [isProcessingAllData, setIsProcessingAllData] = useState(false);

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

  const { data: stats, refetch: refetchStats } = useQuery({
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

  const handleProcessUserData = async () => {
    try {
      setIsProcessingUserData(true);
      await processUserDataForEmbeddings();
      toast.success("Benutzerdaten wurden erfolgreich für AI-Embeddings verarbeitet");
      refetchStats();
    } catch (error) {
      console.error("Fehler bei der Verarbeitung von Benutzerdaten:", error);
      toast.error("Fehler bei der Verarbeitung von Benutzerdaten: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessingUserData(false);
    }
  };

  const handleProcessTeamData = async () => {
    try {
      setIsProcessingTeamData(true);
      await processTeamDataForEmbeddings();
      toast.success("Teamdaten wurden erfolgreich für AI-Embeddings verarbeitet");
      refetchStats();
    } catch (error) {
      console.error("Fehler bei der Verarbeitung von Teamdaten:", error);
      toast.error("Fehler bei der Verarbeitung von Teamdaten: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessingTeamData(false);
    }
  };

  const handleProcessAllData = async () => {
    try {
      setIsProcessingAllData(true);
      // Zuerst Benutzerdaten verarbeiten
      await processUserDataForEmbeddings();
      // Dann Teamdaten verarbeiten
      await processTeamDataForEmbeddings();
      toast.success("Alle Daten wurden erfolgreich für AI-Embeddings verarbeitet");
      refetchStats();
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Daten:", error);
      toast.error("Fehler bei der Verarbeitung: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessingAllData(false);
    }
  };

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
        toast.success("Die Verarbeitung bestehenden Daten wurde gestartet");
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Embeddings Manager</CardTitle>
        <CardDescription>
          Verwalten Sie die AI-Embeddings für Ihren Chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-md p-3">
                <div className="text-xs text-muted-foreground">Content Embeddings</div>
                <div className="text-xl font-bold">{stats?.contentCount || 0}</div>
              </div>
              <div className="bg-muted rounded-md p-3">
                <div className="text-xs text-muted-foreground">Nexus Embeddings</div>
                <div className="text-xl font-bold">{stats?.nexusCount || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Aktionen</h3>
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleProcessUserData} 
                  disabled={isProcessingUserData || isProcessingAllData}
                  variant="outline"
                >
                  {isProcessingUserData ? "Verarbeite Benutzerdaten..." : "Benutzerdaten verarbeiten"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Konvertiert alle persönlichen Daten (Einstellungen, Aufgaben, Leads usw.) in Embeddings.
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleProcessTeamData} 
                  disabled={isProcessingTeamData || isProcessingAllData}
                  variant="outline"
                >
                  {isProcessingTeamData ? "Verarbeite Teamdaten..." : "Teamdaten verarbeiten"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Konvertiert alle Teamdaten in Embeddings, die von allen Teammitgliedern genutzt werden können.
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleProcessAllData} 
                  disabled={isProcessingUserData || isProcessingTeamData || isProcessingAllData}
                  variant="default"
                >
                  {isProcessingAllData ? "Verarbeite alle Daten..." : "Alle Daten verarbeiten"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Konvertiert alle Benutzer- und Teamdaten in Embeddings für den KI-Zugriff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
