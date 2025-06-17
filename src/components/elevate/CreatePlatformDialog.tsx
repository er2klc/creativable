
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreatePlatformDialogProps {
  onPlatformCreated?: () => void;
}

export function CreatePlatformDialog({ onPlatformCreated }: CreatePlatformDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setIsSubmitting(true);
    try {
      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('platform-logos')
          .upload(fileName, logoFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('platform-logos')
            .getPublicUrl(fileName);
          logoUrl = data.publicUrl;
        }
      }

      // Create platform
      const { data: platform, error } = await supabase
        .from("elevate_platforms" as any)
        .insert([{
          name: name.trim(),
          description: description.trim() || null,
          created_by: user.id,
          logo_url: logoUrl,
        }])
        .select()
        .single();

      if (error) throw error;

      // Grant creator access
      await supabase
        .from("elevate_user_access" as any)
        .insert({
          platform_id: platform.id,
          user_id: user.id,
          access_type: 'admin',
          granted_by: user.id,
        });

      toast.success("Plattform erfolgreich erstellt!");
      setOpen(false);
      setName("");
      setDescription("");
      setLogoFile(null);
      onPlatformCreated?.();
    } catch (error: any) {
      console.error('Error creating platform:', error);
      toast.error("Fehler beim Erstellen der Plattform: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neue Plattform
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Elevate-Plattform erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine neue Lernplattform für Ihr Team oder Ihre Organisation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name der Plattform *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Marketing Masterclass"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie Ihre Lernplattform..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="logo">Logo (optional)</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Erstellen..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
