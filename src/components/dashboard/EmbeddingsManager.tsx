
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface ChatbotSettings {
  id: string;
  user_id: string;
  openai_api_key: string | null;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
}

export const EmbeddingsManager = () => {
  const [apiKey, setApiKey] = useState("");
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["chatbot-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_settings" as any)
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data as ChatbotSettings;
    },
  });

  const { data: contentEmbeddings } = useQuery({
    queryKey: ["content-embeddings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_embeddings" as any)
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: nexusEmbeddings } = useQuery({
    queryKey: ["nexus-embeddings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nexus_embeddings" as any)
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newApiKey: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("chatbot_settings" as any)
        .upsert({
          user_id: user.id,
          openai_api_key: newApiKey,
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1000
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });
      toast.success("API-Schlüssel erfolgreich gespeichert");
    },
    onError: (error) => {
      toast.error("Fehler beim Speichern: " + error.message);
    }
  });

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Bitte geben Sie einen API-Schlüssel ein");
      return;
    }
    updateSettings.mutate(apiKey);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Einstellungen</CardTitle>
          <CardDescription>
            Konfigurieren Sie Ihren OpenAI API-Schlüssel für KI-Features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">OpenAI API-Schlüssel</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          <Button onClick={handleSaveApiKey} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Speichern..." : "Speichern"}
          </Button>
          {settings?.openai_api_key && (
            <p className="text-sm text-green-600">
              API-Schlüssel ist konfiguriert ✓
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embeddings Übersicht</CardTitle>
          <CardDescription>
            Überblick über Ihre gespeicherten Embeddings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Content Embeddings</h3>
              <p className="text-2xl font-bold text-blue-600">
                {contentEmbeddings?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Gespeicherte Inhalte
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Nexus Embeddings</h3>
              <p className="text-2xl font-bold text-purple-600">
                {nexusEmbeddings?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Team-geteilte Inhalte
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
