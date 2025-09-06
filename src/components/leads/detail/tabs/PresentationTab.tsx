
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";

interface PresentationTabProps {
  leadId: string;
  type: string;
  tabColors: Record<string, string>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PresentationTab = ({
  leadId,
  type,
  tabColors,
  isOpen,
  onOpenChange,
}: PresentationTabProps) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [expiresIn, setExpiresIn] = useState("never");
  const [isManualInput, setIsManualInput] = useState(true);
  const { user } = useAuth();
  const { settings } = useSettings();

  // Hilfsfunktion für YouTube Video IDs
  const getVideoId = (url: string): string | null => {
    // YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Hilfsfunktion für Slug-Generierung
  const generateSlug = (title: string, videoId: string): string => {
    // Einfachen slug aus Titel erstellen
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Zeitstempel hinzufügen, um Einzigartigkeit zu gewährleisten
    const timestamp = Date.now().toString(36);
    
    return `${baseSlug}-${videoId}-${timestamp}`;
  };

  type SimpleUserLink = {
    id: string;
    title: string;
    url: string;
    is_favorite: boolean;
  };

  const { data: userLinks = [] } = useQuery({
    queryKey: ['user-links', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_links')
        .select('id,title,url')
        .eq('group_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        is_favorite: false
      }));
    },
  }) as { data: SimpleUserLink[] };

  const handleLinkSelect = (link: any) => {
    setUrl(link.url);
    setTitle(link.title);
  };

  const calculateExpiryDate = (expiresIn: string): Date | null => {
    if (expiresIn === "never") return null;
    
    const now = new Date();
    switch (expiresIn) {
      case "1hour":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "1day":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "1week":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "1month":
        return new Date(now.setMonth(now.getMonth() + 1));
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!url) {
        toast.error("Bitte geben Sie eine URL ein");
        return;
      }

      if (type === "youtube") {
        const videoId = getVideoId(url);
        if (!videoId) {
          toast.error("Ungültige YouTube-URL");
          return;
        }

        const slug = generateSlug(title || url, videoId);
        const expiryDate = calculateExpiryDate(expiresIn);
        
        const { data: pageData, error: pageError } = await supabase
          .from('presentation_pages')
          .insert({
            lead_id: leadId,
            user_id: user?.id,
            title: title || url,
            video_url: url,
            slug: slug,
            expires_at: expiryDate.toISOString(),
            is_url_active: true
          })
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

        toast.success("YouTube Video erfolgreich hinzugefügt");
      } else if (type === "zoom") {
        // Implementierung für Zoom-Links
        const { error: noteError } = await supabase
          .from("notes")
          .insert([
            {
              lead_id: leadId,
              user_id: user?.id,
              content: url,
              metadata: {
                type: "zoom",
                title: title || "Zoom Meeting",
                url: url
              }
            }
          ]);

        if (noteError) throw noteError;
        toast.success("Zoom-Link erfolgreich hinzugefügt");
      } else if (type === "documents") {
        // Implementierung für Dokumente
        const { error: noteError } = await supabase
          .from("notes")
          .insert([
            {
              lead_id: leadId,
              user_id: user?.id,
              content: url,
              metadata: {
                type: "document",
                title: title || "Dokument",
                url: url
              }
            }
          ]);

        if (noteError) throw noteError;
        toast.success("Dokument-Link erfolgreich hinzugefügt");
      }

      setUrl("");
      setTitle("");
      setExpiresIn("never");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding presentation:", error);
      toast.error("Fehler beim Hinzufügen der Präsentation");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4 p-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={isManualInput ? "default" : "outline"}
              onClick={() => setIsManualInput(true)}
            >
              Manuell eingeben
            </Button>
            <Button
              variant={!isManualInput ? "default" : "outline"}
              onClick={() => setIsManualInput(false)}
            >
              Aus Links auswählen
            </Button>
          </div>

          {isManualInput ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Titel (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${type === "youtube" ? "YouTube Video" : type === "zoom" ? "Zoom Meeting" : "Dokument"} Titel`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={`${type === "youtube" ? "YouTube" : type === "zoom" ? "Zoom" : "Dokument"} URL`}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {userLinks.length > 0 ? (
                userLinks.map((link: any) => (
                  <div
                    key={link.id}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-gray-100 ${
                      url === link.url ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleLinkSelect(link)}
                  >
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">{link.url}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Keine gespeicherten Links vorhanden
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expires">URL gültig für</Label>
            <select
              id="expires"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="never">Unbegrenzt</option>
              <option value="1day">1 Tag</option>
              <option value="7days">7 Tage</option>
              <option value="30days">30 Tage</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit}>Hinzufügen</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
