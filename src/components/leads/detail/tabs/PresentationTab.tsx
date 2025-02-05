
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Youtube, FileText, Plus } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PresentationTabProps {
  leadId: string;
  type: "zoom" | "youtube" | "documents";
  tabColors: Record<string, string>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserLink {
  id: string;
  title: string;
  url: string;
  group_type: string;
  is_favorite: boolean;
}

export function PresentationTab({ leadId, type, tabColors, isOpen, onOpenChange }: PresentationTabProps) {
  const [links, setLinks] = useState<UserLink[]>([]);
  const { toast } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    loadLinks();
  }, [type]);

  const loadLinks = async () => {
    const { data, error } = await supabase
      .from('user_links')
      .select('*')
      .eq('group_type', type)
      .order('is_favorite', { ascending: false });

    if (error) {
      toast({
        title: "Error loading links",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setLinks(data || []);
  };

  const createPresentationPage = async (link: UserLink) => {
    try {
      const slug = link.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('presentation_pages')
        .insert([
          {
            lead_id: leadId,
            title: link.title,
            video_url: link.url,
            slug: slug
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const baseUrl = window.location.origin;
      const presentationUrl = `${baseUrl}/presentation/${leadId}/${data.id}`;

      // Add to timeline
      const { error: noteError } = await supabase
        .from('notes')
        .insert([
          {
            lead_id: leadId,
            content: link.url,
            metadata: {
              type: 'presentation',
              presentationType: type,
              title: link.title,
              url: presentationUrl
            }
          }
        ]);

      if (noteError) throw noteError;

      toast({
        title: settings?.language === "en" ? "Added to timeline" : "Zur Timeline hinzugefügt",
        description: settings?.language === "en" ? 
          "The presentation page has been created" : 
          "Die Präsentationsseite wurde erstellt"
      });
      
      // Copy URL to clipboard
      await navigator.clipboard.writeText(presentationUrl);
      toast({
        title: settings?.language === "en" ? "URL copied" : "URL kopiert",
        description: settings?.language === "en" ? 
          "The presentation URL has been copied to your clipboard" : 
          "Die Präsentations-URL wurde in die Zwischenablage kopiert"
      });

    } catch (error: any) {
      console.error('Error creating presentation page:', error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }

    onOpenChange(false);
  };

  const getIcon = () => {
    switch (type) {
      case "zoom":
        return <Video className="w-4 h-4" style={{ color: tabColors.zoom }} />;
      case "youtube":
        return <Youtube className="w-4 h-4" style={{ color: tabColors.youtube }} />;
      case "documents":
        return <FileText className="w-4 h-4" style={{ color: tabColors.documents }} />;
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderContent = () => (
    <div className="space-y-4">
      {links.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {settings?.language === "en" ? 
            "No links available. Add some links in the Links section." : 
            "Keine Links verfügbar. Fügen Sie Links im Bereich Links hinzu."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {links.map((link) => (
            <Card key={link.id} className="p-4">
              <div className="flex items-start space-x-4">
                {getIcon()}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{link.title}</p>
                  {type === 'youtube' && getYoutubeVideoId(link.url) && (
                    <div className="aspect-video w-full max-w-[200px] my-2">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(link.url)}`}
                        title={link.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground break-all">
                    {link.url}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => createPresentationPage(link)}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {settings?.language === "en" ? "Add" : "Hinzufügen"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en" ? "Select Link" : "Link auswählen"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
