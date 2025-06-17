
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShortcutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShortcutCreated: () => void;
}

export function ShortcutDialog({ open, onOpenChange, onShortcutCreated }: ShortcutDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [shortcutKey, setShortcutKey] = useState("");
  const [icon, setIcon] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("shortcuts" as any)
        .insert({
          user_id: user.id,
          title,
          url,
          shortcut_key: shortcutKey || null,
          icon: icon || null,
        });

      if (error) throw error;

      toast.success("Shortcut erfolgreich erstellt");
      onShortcutCreated();
      onOpenChange(false);
      setTitle("");
      setUrl("");
      setShortcutKey("");
      setIcon("");
    } catch (error: any) {
      toast.error("Fehler beim Erstellen des Shortcuts: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Shortcut erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Google Drive"
                required
              />
            </div>
            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <Label htmlFor="shortcutKey">Tastenkürzel (optional)</Label>
              <Input
                id="shortcutKey"
                value={shortcutKey}
                onChange={(e) => setShortcutKey(e.target.value)}
                placeholder="z.B. Ctrl+Shift+G"
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="z.B. link, folder, etc."
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Erstellen..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
