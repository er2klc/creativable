import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { generateUniqueSlug, generatePresentationUrl, copyToClipboard } from "@/utils/presentationUtils";

interface UserLink {
  id: string;
  title: string;
  url: string;
  group_type: string;
  is_favorite: boolean;
}

export function usePresentationPage(leadId: string, onClose: () => void) {
  const [links, setLinks] = useState<UserLink[]>([]);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuth();

  const loadLinks = async (type: string) => {
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
    if (!user) {
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? 
          "You must be logged in" : 
          "Sie müssen angemeldet sein",
        variant: "destructive"
      });
      return;
    }

    try {
      const baseSlug = link.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const uniqueSlug = generateUniqueSlug(baseSlug);
      const presentationUrl = generatePresentationUrl(leadId, uniqueSlug);

      if (link.group_type === 'youtube') {
        // For YouTube links, create a note with YouTube metadata
        const { error: noteError } = await supabase
          .from('notes')
          .insert([
            {
              lead_id: leadId,
              user_id: user.id,
              content: link.url,
              metadata: {
                type: 'youtube',
                title: link.title,
                url: link.url,
                presentationUrl
              }
            }
          ]);

        if (noteError) throw noteError;

        toast({
          title: settings?.language === "en" ? "Added to timeline" : "Zur Timeline hinzugefügt",
          description: settings?.language === "en" ? 
            "The YouTube video has been added" : 
            "Das YouTube-Video wurde hinzugefügt"
        });
      } else {
        // For other types, create a presentation page
        const { data, error } = await supabase
          .from('presentation_pages')
          .insert([
            {
              lead_id: leadId,
              user_id: user.id,
              title: link.title,
              video_url: link.url,
              slug: uniqueSlug
            }
          ])
          .select()
          .single();

        if (error) throw error;

        const { error: noteError } = await supabase
          .from('notes')
          .insert([
            {
              lead_id: leadId,
              user_id: user.id,
              content: link.url,
              metadata: {
                type: 'presentation',
                presentationType: link.group_type,
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
      }
      
      const copied = await copyToClipboard(presentationUrl);
      if (copied) {
        toast({
          title: settings?.language === "en" ? "URL copied" : "URL kopiert",
          description: settings?.language === "en" ? 
            "The URL has been copied to your clipboard" : 
            "Die URL wurde in die Zwischenablage kopiert"
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error creating presentation page:', error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    links,
    loadLinks,
    createPresentationPage
  };
}