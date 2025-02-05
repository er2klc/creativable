import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import { LinkGroup } from "@/components/links/LinkGroup";
import { AddLinkDialog } from "@/components/links/AddLinkDialog";
import { BulkAddLinksDialog } from "@/components/links/BulkAddLinksDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type UserLink = {
  id: string;
  title: string;
  url: string;
  group_type: 'youtube' | 'zoom' | 'documents' | 'partner' | 'customer' | 'meeting' | 'other' | 'presentation';
  is_favorite: boolean;
  order_index: number;
  custom_group_name?: string;
};

const Links = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: links = [], isLoading, refetch } = useQuery({
    queryKey: ['user-links'],
    queryFn: async () => {
      console.log("Fetching links...");
      const { data, error } = await supabase
        .from('user_links')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('order_index', { ascending: true });

      if (error) {
        toast({
          title: "Error loading links",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      console.log("Fetched links:", data);
      return data as UserLink[];
    },
  });

  const favoriteLinks = links.filter(link => link.is_favorite);
  const youtubeLinks = links.filter(link => link.group_type === 'youtube');
  const zoomLinks = links.filter(link => link.group_type === 'zoom');
  const documentLinks = links.filter(link => link.group_type === 'documents');
  const partnerLinks = links.filter(link => link.group_type === 'partner');
  const customerLinks = links.filter(link => link.group_type === 'customer');
  const meetingLinks = links.filter(link => link.group_type === 'meeting');
  const presentationLinks = links.filter(link => link.group_type === 'presentation');
  const otherLinks = links.filter(link => link.group_type === 'other');

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Meine Links</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkAddDialogOpen(true)} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Link hinzufügen
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {favoriteLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Favoriten" 
              links={favoriteLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {youtubeLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="YouTube Links" 
              links={youtubeLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {zoomLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Zoom Links" 
              links={zoomLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {documentLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Dokumente" 
              links={documentLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {partnerLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Partner Links" 
              links={partnerLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {customerLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Kunden Links" 
              links={customerLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {meetingLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Meeting Links" 
              links={meetingLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {presentationLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Präsentation Links" 
              links={presentationLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {otherLinks.length > 0 && (
          <Card className="p-4">
            <LinkGroup 
              title="Sonstige Links" 
              links={otherLinks} 
              onUpdate={refetch}
            />
          </Card>
        )}

        {links.length === 0 && !isLoading && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Noch keine Links vorhanden</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setIsBulkAddDialogOpen(true)} variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Link hinzufügen
              </Button>
            </div>
          </Card>
        )}
      </div>

      <AddLinkDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refetch}
      />

      <BulkAddLinksDialog
        open={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Links;