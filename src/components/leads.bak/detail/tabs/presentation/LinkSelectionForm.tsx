
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useQueryClient } from "@tanstack/react-query";

interface LinkSelectionFormProps {
  leadId: string;
  type: string;
  onSuccess: () => void;
}

export function LinkSelectionForm({ leadId, type, onSuccess }: LinkSelectionFormProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Diese Funktion ist ein Platzhalter - in einer echten Implementierung würden hier tatsächlich Links geladen werden
  const links = [
    { id: 1, title: "Beispiel YouTube Video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: 2, title: "Produktdemo", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  ];

  const handleSubmit = async () => {
    if (!selectedLink) {
      toast.error(settings?.language === "en" ? "Please select a link" : "Bitte wählen Sie einen Link aus");
      return;
    }

    setIsLoading(true);
    try {
      // Je nach Typ unterschiedliche Aktionen durchführen
      if (type === "youtube") {
        // Für YouTube-Links
        const { error } = await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: user?.id,
            content: selectedLink.url,
            metadata: {
              type: "youtube",
              title: selectedLink.title,
              url: selectedLink.url
            }
          });

        if (error) throw error;
      } else if (type === "zoom") {
        // Für Zoom-Links
        const { error } = await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: user?.id,
            content: selectedLink.url,
            metadata: {
              type: "zoom",
              title: selectedLink.title,
              url: selectedLink.url
            }
          });

        if (error) throw error;
      } else {
        // Für Dokumente
        const { error } = await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: user?.id,
            content: selectedLink.url,
            metadata: {
              type: "document",
              title: selectedLink.title,
              url: selectedLink.url
            }
          });

        if (error) throw error;
      }

      // Cache invalidieren, um die Timeline zu aktualisieren
      await queryClient.invalidateQueries({ queryKey: ["lead-with-relations", leadId] });
      
      toast.success(
        settings?.language === "en" 
          ? "Link added successfully" 
          : "Link erfolgreich hinzugefügt"
      );
      
      onSuccess();
    } catch (error) {
      console.error("Error adding link:", error);
      toast.error(
        settings?.language === "en" 
          ? "Error adding link" 
          : "Fehler beim Hinzufügen des Links"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {links.map((link) => (
          <Card
            key={link.id}
            className={`p-3 cursor-pointer hover:bg-gray-100 ${
              selectedLink?.id === link.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => setSelectedLink(link)}
          >
            <p className="font-medium">{link.title}</p>
            <p className="text-sm text-muted-foreground">{link.url}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedLink || isLoading}
        >
          {isLoading 
            ? (settings?.language === "en" ? "Adding..." : "Wird hinzugefügt...") 
            : (settings?.language === "en" ? "Add Link" : "Link hinzufügen")}
        </Button>
      </div>
    </div>
  );
}
