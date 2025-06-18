
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Brain, Database, Trash2 } from "lucide-react";

export const EmbeddingsManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['chatbot-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching chatbot settings:', error);
        return null;
      }

      return data;
    }
  });

  const { data: embeddingsCount = 0 } = useQuery({
    queryKey: ['embeddings-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('content_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching embeddings count:', error);
        return 0;
      }

      return count || 0;
    }
  });

  const handleCreateEmbeddings = async () => {
    if (!settings?.openai_api_key) {
      toast.error("Bitte konfigurieren Sie zuerst Ihren OpenAI API Key in den Einstellungen");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-embeddings');
      
      if (error) throw error;
      
      toast.success(`${data.count} Embeddings erfolgreich erstellt`);
    } catch (error) {
      console.error('Error creating embeddings:', error);
      toast.error("Fehler beim Erstellen der Embeddings");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEmbeddings = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('content_embeddings')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Alle Embeddings wurden gelöscht");
    } catch (error) {
      console.error('Error deleting embeddings:', error);
      toast.error("Fehler beim Löschen der Embeddings");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5" />
        <h3 className="text-lg font-semibold">KI-Embeddings</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4" />
            <span className="font-medium">Gespeicherte Embeddings</span>
          </div>
          <p className="text-2xl font-bold">{embeddingsCount}</p>
          <p className="text-sm text-muted-foreground">Verarbeitete Inhalte</p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleCreateEmbeddings}
            disabled={isCreating || !settings?.openai_api_key}
            className="w-full"
          >
            {isCreating ? "Erstelle Embeddings..." : "Embeddings erstellen"}
          </Button>
          
          <Button 
            onClick={handleDeleteEmbeddings}
            disabled={isDeleting || embeddingsCount === 0}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Lösche..." : "Alle Embeddings löschen"}
          </Button>
        </div>
      </div>
    </div>
  );
};
