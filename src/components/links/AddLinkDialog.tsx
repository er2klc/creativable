
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddLinkDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddLinkDialogProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [groupType, setGroupType] = useState<string>("other");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Get the currently authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add links",
        variant: "destructive",
      });
      return;
    }

    // Ensure URL has protocol
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

    const { error } = await supabase
      .from('user_links')
      .insert({
        title,
        url: formattedUrl,
        group_type: groupType,
        user_id: session.user.id, // Add the user_id field
      });

    if (error) {
      toast({
        title: "Error creating link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Link created",
      description: "Your link has been added successfully",
    });

    setTitle("");
    setUrl("");
    setGroupType("other");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link hinzufügen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Meeting Link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Gruppe</Label>
            <Select value={groupType} onValueChange={setGroupType}>
              <SelectTrigger>
                <SelectValue placeholder="Wähle eine Gruppe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="customer">Kunden</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="presentation">Präsentation</SelectItem>
                <SelectItem value="other">Sonstige</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Link speichern
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
