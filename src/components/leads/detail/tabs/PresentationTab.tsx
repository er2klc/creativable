import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ManualInputForm } from "./presentation/ManualInputForm";
import { LinkSelectionForm } from "./presentation/LinkSelectionForm";
import { ExpirySelect } from "./presentation/ExpirySelect";
import { getVideoId, generateSlug } from "./presentation/presentationUtils";
import { UserLink } from "@/pages/Links";

interface PresentationTabProps {
  leadId: string;
  type: string;
  tabColors: Record<string, string>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export const PresentationTab = ({
  leadId,
  type,
  isOpen,
  onOpenChange,
}: PresentationTabProps) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [expiresIn, setExpiresIn] = useState("never");
  const [isManualInput, setIsManualInput] = useState(false);
  const { user } = useAuth();

  const { data: userLinks = [] } = useQuery({
    queryKey: ['user-links', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_links')
        .select('*')
        .eq('group_type', type)
        .order('is_favorite', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleLinkSelect = (link: UserLink) => {
    setUrl(link.url);
    setTitle(link.title);
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
        const slug = generateSlug(title || url, videoId);
        const expiryDate = calculateExpiryDate(expiresIn);
        
        const { data: pageData, error: pageError } = await supabase
          .from('presentation_pages')
          .insert([
            {
              lead_id: leadId,
              user_id: user?.id,
              title: title || url,
              video_url: url,
              slug: slug,
              expires_at: expiryDate,
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
            <ManualInputForm
              title={title}
              url={url}
              onTitleChange={setTitle}
              onUrlChange={setUrl}
              type={type}
            />
          ) : (
            <LinkSelectionForm
              userLinks={userLinks}
              selectedUrl={url}
              onLinkSelect={handleLinkSelect}
            />
          )}

          <ExpirySelect 
            expiresIn={expiresIn}
            onChange={setExpiresIn}
          />

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