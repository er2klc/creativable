import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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
  isOpen,
  onOpenChange,
}: PresentationTabProps) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [expiresIn, setExpiresIn] = useState("never"); // never, 1day, 7days, 30days
  const { user } = useAuth();

  const getVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };

  const calculateExpiryDate = () => {
    if (expiresIn === 'never') return null;
    
    const now = new Date();
    const days = {
      '1day': 1,
      '7days': 7,
      '30days': 30
    }[expiresIn] || 0;
    
    return new Date(now.setDate(now.getDate() + days));
  };

  const handleSubmit = async () => {
    try {
      if (!url) {
        toast.error("Bitte geben Sie eine URL ein");
        return;
      }

      const videoId = getVideoId(url);
      if (!videoId) {
        toast.error("Ungültige YouTube-URL");
        return;
      }

      if (type === "youtube") {
        const { error } = await supabase.from("notes").insert([
          {
            lead_id: leadId,
            user_id: user?.id,
            content: url,
            metadata: {
              type: "youtube",
              title: title || url,
              url: url,
              videoId: videoId,
              presentationUrl: `/presentation/${leadId}/${videoId}`
            }
          }
        ]);

        if (error) throw error;

        // Create presentation page
        const { error: pageError } = await supabase
          .from('presentation_pages')
          .insert([
            {
              lead_id: leadId,
              user_id: user?.id,
              title: title || url,
              video_url: url,
              slug: videoId,
              expires_at: calculateExpiryDate()
            }
          ]);

        if (pageError) throw pageError;

        toast.success("YouTube Video erfolgreich hinzugefügt");
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
      <DialogContent>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video Titel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`${type === "youtube" ? "YouTube" : type} URL`}
            />
          </div>
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