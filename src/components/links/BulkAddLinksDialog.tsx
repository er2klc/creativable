
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BulkAddLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BulkAddLinksDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: BulkAddLinksDialogProps) => {
  const [urls, setUrls] = useState("");
  const { toast } = useToast();

  const detectLinkType = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // Detect Zoom links
      if (urlObj.hostname.includes('zoom.')) {
        const meetingId = urlObj.pathname.split('/').pop() || '';
        return {
          title: `Zoom Meeting (ID: ${meetingId})`,
          group_type: 'zoom'
        };
      }
      
      // Detect YouTube links
      if (urlObj.hostname.includes('youtube.') || urlObj.hostname.includes('youtu.be')) {
        return {
          title: 'YouTube Video',
          group_type: 'youtube'
        };
      }

      // Detect document links
      const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
      if (documentExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext))) {
        return {
          title: 'Document',
          group_type: 'documents'
        };
      }
      
      // Default case
      return {
        title: urlObj.hostname,
        group_type: 'other'
      };
    } catch (e) {
      return {
        title: url,
        group_type: 'other'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!urls.trim()) {
      toast({
        title: "Validation Error",
        description: "Bitte füge mindestens eine URL ein",
        variant: "destructive",
      });
      return;
    }

    // Get the currently authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        title: "Authentication Error",
        description: "Du musst eingeloggt sein um Links hinzuzufügen",
        variant: "destructive",
      });
      return;
    }

    // Split URLs by newline and filter empty lines
    const urlList = urls.split('\n').filter(url => url.trim());
    
    // Prepare links for insertion
    const links = urlList.map(url => {
      const { title, group_type } = detectLinkType(url.trim());
      const formattedUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      
      return {
        title,
        url: formattedUrl,
        group_type,
        user_id: session.user.id,
      };
    });

    // Insert all links
    const { error } = await supabase
      .from('user_links')
      .insert(links);

    if (error) {
      toast({
        title: "Error creating links",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Links erstellt",
      description: `${links.length} Links wurden erfolgreich hinzugefügt`,
    });

    setUrls("");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Links Bulk Import</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="Füge hier mehrere URLs ein (eine URL pro Zeile)"
              className="min-h-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Tipp: Zoom-Links werden automatisch als Meetings erkannt (mit Meeting-ID), YouTube-Links als Präsentationen
            </p>
          </div>

          <Button type="submit" className="w-full">
            Links importieren
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
