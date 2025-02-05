import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Youtube, FileText, Plus } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface PresentationTabProps {
  leadId: string;
  type: "zoom" | "youtube" | "documents";
  tabColors: Record<string, string>;
}

interface UserLink {
  id: string;
  title: string;
  url: string;
  group_type: string;
}

export function PresentationTab({ leadId, type, tabColors }: PresentationTabProps) {
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
      .eq('group_type', type);

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

  const addToTimeline = async (link: UserLink) => {
    const { error } = await supabase
      .from('notes')
      .insert([
        {
          lead_id: leadId,
          content: link.url,
          metadata: {
            type: 'presentation',
            presentationType: type,
            title: link.title,
            url: link.url
          }
        }
      ]);

    if (error) {
      toast({
        title: "Error adding to timeline",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: settings?.language === "en" ? "Added to timeline" : "Zur Timeline hinzugefügt",
      description: settings?.language === "en" ? 
        "The link has been added to the timeline" : 
        "Der Link wurde zur Timeline hinzugefügt"
    });
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

  return (
    <div className="space-y-4">
      {links.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {settings?.language === "en" ? 
            "No links available. Add some links in the Links section." : 
            "Keine Links verfügbar. Fügen Sie Links im Bereich Links hinzu."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <Card key={link.id} className="p-4">
              <div className="flex items-start space-x-4">
                {getIcon()}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{link.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {link.url}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addToTimeline(link)}
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
}