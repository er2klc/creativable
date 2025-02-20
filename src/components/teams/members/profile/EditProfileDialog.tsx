
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, MapPin, Link as LinkIcon, Instagram, Linkedin, Mail } from "lucide-react";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    id: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    personality_type?: string;
    location?: string;
    social_links?: {
      website?: string;
      instagram?: string;
      linkedin?: string;
    };
    email?: string;
  };
}

export function EditProfileDialog({ isOpen, onClose, profileData }: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profileData.display_name || "",
    bio: profileData.bio || "",
    avatar_url: profileData.avatar_url || null,
    personality_type: profileData.personality_type || "",
    location: profileData.location || "",
    social_links: profileData.social_links || {},
    email: profileData.email || ""
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${profileData.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) {
        toast.error('Fehler beim Hochladen des Bildes');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          personality_type: formData.personality_type,
          location: formData.location,
          social_links: formData.social_links,
          email: formData.email
        })
        .eq('id', profileData.id);

      if (error) throw error;

      toast.success('Profil erfolgreich aktualisiert');
      onClose();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Profils');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col max-h-[85vh] p-0 gap-0 w-[95vw] sm:max-w-[400px]">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle>Profil bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <TeamLogoUpload
                currentLogoUrl={formData.avatar_url}
                onLogoChange={handleAvatarChange}
                onLogoRemove={() => setFormData(prev => ({ ...prev, avatar_url: null }))}
                logoPreview={avatarPreview}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Dein Name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Über mich</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Erzähle etwas über dich..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Persönlichkeitstyp
              </Label>
              <Input
                value={formData.personality_type}
                onChange={(e) => setFormData(prev => ({ ...prev, personality_type: e.target.value }))}
                placeholder="z.B. INFJ, ENTJ..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Standort
              </Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="z.B. Berlin, Deutschland"
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Website
              </Label>
              <Input
                value={formData.social_links?.website || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  social_links: { ...prev.social_links, website: e.target.value }
                }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram Benutzername
              </Label>
              <Input
                value={formData.social_links?.instagram || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  social_links: { ...prev.social_links, instagram: e.target.value }
                }))}
                placeholder="@username"
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn URL
              </Label>
              <Input
                value={formData.social_links?.linkedin || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  social_links: { ...prev.social_links, linkedin: e.target.value }
                }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-4 bg-background border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
