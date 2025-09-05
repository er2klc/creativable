
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useQueryClient } from "@tanstack/react-query";
import { presentationUtils } from "../index";

interface ManualInputFormProps {
  leadId: string;
  type: string;
  onSuccess: () => void;
}

export function ManualInputForm({ leadId, type, onSuccess }: ManualInputFormProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url) {
      toast.error(settings?.language === "en" ? "Please enter a URL" : "Bitte geben Sie eine URL ein");
      return;
    }

    setIsLoading(true);
    try {
      // Je nach Typ unterschiedliche Aktionen durchführen
      if (type === "youtube") {
        // Für YouTube-Links
        const videoId = presentationUtils.getVideoId(url);
        if (!videoId) {
          toast.error(settings?.language === "en" ? "Invalid YouTube URL" : "Ungültige YouTube-URL");
          return;
        }

        const slug = presentationUtils.generateSlug(title || url, videoId);
        
        const { data: pageData, error: pageError } = await supabase
          .from('presentation_pages')
          .insert([
            {
              lead_id: leadId,
              user_id: user?.id,
              title: title || url,
              video_url: url,
              slug: slug,
              is_url_active: true
            }
          ])
          .select()
          .single();

        if (pageError) throw pageError;

        const { error: noteError } = await supabase
          .from("notes")
          .insert([
            {
              lead_id: leadId,
              user_id: user?.id,
              content: url,
              metadata: {
                type: "youtube",
                title: title || url,
                url: url,
                videoId: videoId,
                presentationUrl: `${window.location.origin}/presentation/${leadId}/${slug}`
              }
            }
          ]);

        if (noteError) throw noteError;
      } else if (type === "zoom") {
        // Für Zoom-Links
        const { error } = await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: user?.id,
            content: url,
            metadata: {
              type: "zoom",
              title: title || "Zoom Meeting",
              url: url
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
            content: url,
            metadata: {
              type: "document",
              title: title || "Dokument",
              url: url
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
      <div>
        <Label htmlFor="title">
          {settings?.language === "en" ? "Title" : "Titel"} (optional)
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={settings?.language === "en" ? "Enter title..." : "Titel eingeben..."}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={settings?.language === "en" ? "Enter URL..." : "URL eingeben..."}
          className="mt-1"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!url || isLoading}
        >
          {isLoading 
            ? (settings?.language === "en" ? "Adding..." : "Wird hinzugefügt...") 
            : (settings?.language === "en" ? "Add Link" : "Link hinzufügen")}
        </Button>
      </div>
    </div>
  );
}
